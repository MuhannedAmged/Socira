import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/library";
import { activeSessionUserId } from "@/lib/auth/session";
import { supabaseAdmin, storageBucket } from "@/lib/storage/supabase";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey, crossOriginBlock } from "@/lib/http/request";

export const runtime = "nodejs";

const createSchema = z.object({
  path: z.string().min(1).max(300),
  mime: z.string().min(3).max(100),
  size: z.number().int().positive().max(512 * 1024 * 1024),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSec: z.number().positive().optional(),
});

/** Signed read URLs so a private bucket can still render thumbnails. */
async function signRead(path: string): Promise<string | null> {
  try {
    const admin = supabaseAdmin();
    const { data } = await admin.storage.from(storageBucket()).createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

/** GET /api/media — the caller's assets, newest first, with short-lived read URLs. */
export async function GET() {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();
  const assets = await MediaAsset.find({ ownerId: uid }).sort({ createdAt: -1 }).limit(60).lean();
  const items = await Promise.all(
    assets.map(async (a) => ({
      id: String(a._id),
      path: a.storagePath,
      mime: a.mime,
      size: a.size,
      width: a.width ?? null,
      height: a.height ?? null,
      durationSec: a.durationSec ?? null,
      status: a.status,
      createdAt: a.createdAt,
      url: await signRead(a.storagePath),
    })),
  );
  return NextResponse.json({ items });
}

/** POST /api/media — record an asset that was uploaded to the caller's own storage prefix. */
export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!rateLimit(rateKey("media:record", req, uid), 60, 60_000).ok) {
    return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid file metadata." }, { status: 400 });
  // The signed-upload URL is minted under `${uid}/`; anything else was not uploaded by this caller.
  if (!parsed.data.path.startsWith(`${uid}/`)) {
    return NextResponse.json({ error: "That storage path does not belong to you." }, { status: 403 });
  }
  await dbConnect();
  const asset = await MediaAsset.create({
    ownerId: uid,
    storagePath: parsed.data.path,
    bucket: storageBucket(),
    mime: parsed.data.mime,
    size: parsed.data.size,
    width: parsed.data.width,
    height: parsed.data.height,
    durationSec: parsed.data.durationSec,
    status: "ready",
  });
  return NextResponse.json({ ok: true, id: String(asset._id), url: await signRead(asset.storagePath) });
}

const removeSchema = z.object({ id: z.string().min(1) });

/** DELETE /api/media — remove the caller's asset from storage and the database. */
export async function DELETE(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success || !mongoose.isValidObjectId(parsed.data.id)) {
    return NextResponse.json({ error: "Invalid asset reference." }, { status: 400 });
  }
  await dbConnect();
  // Owner-scoped delete: the document is only fetched if it belongs to the caller.
  const asset = await MediaAsset.findOneAndDelete({ _id: parsed.data.id, ownerId: uid });
  if (!asset) return NextResponse.json({ error: "Asset not found or not yours." }, { status: 404 });
  try {
    await supabaseAdmin().storage.from(asset.bucket).remove([asset.storagePath]);
  } catch {
    // Storage unreachable — the database record is already gone, so retry later if needed.
  }
  return NextResponse.json({ ok: true });
}
