import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/library";
import { supabaseAdmin, storageBucket } from "@/lib/storage/supabase";
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
  // Only rows pointing at the configured bucket are eligible. A row from another bucket is never
  // passed to the service-role storage client, so tampered data cannot target unrelated objects.
  const bucket = storageBucket();
  const expired = await MediaAsset.find({ ...expiredMediaFilter(), bucket }).limit(MAX_PER_RUN).lean();
  if (expired.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, deleted: 0, failed: 0, remaining: false });
  }

  const paths = expired.map((asset) => asset.storagePath);
  const ids = expired.map((asset) => asset._id);

  let deleted = 0;
  let failed = 0;
  for (let index = 0; index < paths.length; index += BATCH) {
    const batchPaths = paths.slice(index, index + BATCH);
    const batchIds = ids.slice(index, index + BATCH);
    try {
      const { error } = await supabaseAdmin().storage.from(bucket).remove(batchPaths);
      if (error) {
        failed += batchPaths.length;
        continue;
      }
      await MediaAsset.deleteMany({ _id: { $in: batchIds } });
      deleted += batchPaths.length;
    } catch {
      failed += batchPaths.length;
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
