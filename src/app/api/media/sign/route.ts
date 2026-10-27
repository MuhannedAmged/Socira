import { NextResponse } from "next/server";
import { EMAIL_UNVERIFIED_ERROR, verifiedSession } from "@/lib/auth/verification";
import { supabaseAdmin, storageBucket, userScopedPath } from "@/lib/storage/supabase";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey, crossOriginBlock } from "@/lib/http/request";
import { IMAGE_MAX_BYTES, maxBytesForMime, mediaKind } from "@/lib/media/constraints";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  filename: z.string().min(1).max(160),
  mime: z.string().min(3).max(100),
  size: z.number().int().positive(),
});

/** POST /api/media/sign — returns a signed upload URL scoped to the caller. */
export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const session = await verifiedSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!session.emailVerified) {
    return NextResponse.json({ error: EMAIL_UNVERIFIED_ERROR, code: "email_unverified" }, { status: 403 });
  }
  const uid = session.uid;
  // Signed URLs are cheap to mint but each one can store hundreds of megabytes.
  if (!rateLimit(rateKey("media:sign", req, uid), 30, 60_000).ok) {
    return NextResponse.json({ error: "Too many upload requests. Try again in a minute." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid file metadata." }, { status: 400 });
  const { mime, size } = parsed.data;
  const kind = mediaKind(mime);
  if (!kind) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF images and MP4/MOV/WebM video are supported." }, { status: 400 });
  }
  const isImage = kind === "image";
  const max = maxBytesForMime(mime) ?? IMAGE_MAX_BYTES;
  if (size > max) {
    return NextResponse.json(
      { error: `${isImage ? "Images" : "Videos"} must be ${Math.round(max / (1024 * 1024))} MB or smaller.` },
      { status: 413 },
    );
  }
  try {
    const admin = supabaseAdmin();
    const path = userScopedPath(uid, parsed.data.filename);
    const { data, error } = await admin.storage.from(storageBucket()).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
    return NextResponse.json({ ok: true, path, token: data.token, signedUrl: data.signedUrl });
  } catch {
    return NextResponse.json({ error: "Storage is not configured. See .env.example." }, { status: 503 });
  }
}
