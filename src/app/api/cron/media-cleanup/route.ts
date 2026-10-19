import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/library";
import { supabaseAdmin } from "@/lib/storage/supabase";
import { safeEqual } from "@/lib/security/crypto";
import { expiredMediaFilter } from "@/lib/media/retention";

export const runtime = "nodejs";

const BATCH = 100;
const MAX_PER_RUN = 200;

/**
 * GET /api/cron/media-cleanup — deletes media older than three days from Supabase
 * Storage and the library. Requires `Authorization: Bearer $CRON_SECRET`.
 *
 * Storage is removed first; a database record is only deleted for objects Supabase
 * confirmed, so a storage outage leaves the asset retryable on the next run.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Cleanup not configured (no database)." }, { status: 503 });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Cleanup not configured (no Supabase storage)." }, { status: 503 });
  }

  await dbConnect();
  const expired = await MediaAsset.find(expiredMediaFilter()).limit(MAX_PER_RUN).lean();
  if (expired.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, deleted: 0, failed: 0, remaining: false });
  }

  const groups = new Map<string, { ids: unknown[]; paths: string[] }>();
  for (const asset of expired) {
    const group = groups.get(asset.bucket) ?? { ids: [], paths: [] };
    group.ids.push(asset._id);
    group.paths.push(asset.storagePath);
    groups.set(asset.bucket, group);
  }

  let deleted = 0;
  let failed = 0;
  for (const [bucket, group] of groups) {
    for (let index = 0; index < group.paths.length; index += BATCH) {
      const paths = group.paths.slice(index, index + BATCH);
      const ids = group.ids.slice(index, index + BATCH);
      try {
        const { error } = await supabaseAdmin().storage.from(bucket).remove(paths);
        if (error) {
          failed += paths.length;
          continue;
        }
        await MediaAsset.deleteMany({ _id: { $in: ids } });
        deleted += paths.length;
      } catch {
        failed += paths.length;
      }
    }
  }

  return NextResponse.json({
    ok: failed === 0,
    scanned: expired.length,
    deleted,
    failed,
    remaining: expired.length === MAX_PER_RUN,
  });
}
