import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/auth/session";
import { supabaseAdmin, storageBucket, userScopedPath } from "@/lib/storage/supabase";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  filename: z.string().min(1).max(160),
  mime: z.string().min(3).max(100),
  size: z.number().int().positive().max(512 * 1024 * 1024),
});

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/quicktime", "video/webm",
]);

/** POST /api/media/sign — returns a signed upload URL scoped to the caller. */
export async function POST(req: Request) {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid file metadata." }, { status: 400 });
  if (!ALLOWED_MIME.has(parsed.data.mime)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF images and MP4/MOV/WebM video are supported." }, { status: 400 });
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
