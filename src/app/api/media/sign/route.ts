import { NextResponse } from "next/server";
import { activeSessionUserId } from "@/lib/auth/session";
import { supabaseAdmin, storageBucket, userScopedPath } from "@/lib/storage/supabase";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey } from "@/lib/http/request";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  filename: z.string().min(1).max(160),
  mime: z.string().min(3).max(100),
  size: z.number().int().positive(),
});

const IMAGE_MAX = 25 * 1024 * 1024;
const VIDEO_MAX = 512 * 1024 * 1024;

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/quicktime", "video/webm"]);

/** POST /api/media/sign — returns a signed upload URL scoped to the caller. */
export async function POST(req: Request) {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  // Signed URLs are cheap to mint but each one can store hundreds of megabytes.
  if (!rateLimit(rateKey("media:sign", req, uid), 30, 60_000).ok) {
    return NextResponse.json({ error: "Too many upload requests. Try again in a minute." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid file metadata." }, { status: 400 });
  const { mime, size } = parsed.data;
  const isImage = IMAGE_MIME.has(mime);
  const isVideo = VIDEO_MIME.has(mime);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF images and MP4/MOV/WebM video are supported." }, { status: 400 });
  }
  const max = isImage ? IMAGE_MAX : VIDEO_MAX;
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
