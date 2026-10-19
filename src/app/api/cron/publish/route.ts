import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { PostDestination } from "@/models/Post";
import { safeEqual } from "@/lib/security/crypto";

export const runtime = "nodejs";

/** GET /api/cron/publish — hosting cron invokes this with CRON_SECRET. Never publishes arbitrary jobs. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  // Constant-time comparison: a byte-by-byte early exit leaks the secret prefix.
  if (!secret || !provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Scheduler not configured (no database).", due: 0 }, { status: 503 });
  }
  await dbConnect();
  // Atomic claim would use findOneAndUpdate with lock fields; here we only report due work.
  const due = await PostDestination.countDocuments({ status: { $in: ["queued", "publishing"] } });
  return NextResponse.json({
    ok: true,
    due,
    executed: 0,
    note: "Worker executes only with a configured hosting cron. Without it, posts remain planned — never fake-published. See docs/SCHEDULING.md.",
  });
}
