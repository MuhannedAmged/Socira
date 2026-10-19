import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { OAuthAttempt } from "@/models/OAuthAttempt";
import { activeSessionUserId } from "@/lib/auth/session";
import { safeEqual } from "@/lib/security/crypto";

export const runtime = "nodejs";

/**
 * GET /api/social/callback?attemptId=…&state=… — validates a one-time attempt.
 *
 * The state value is compared against the hash stored when the attempt was created. Without that
 * check, a callback URL captured from another session could be replayed into this one (OAuth
 * login CSRF). Code exchange happens server-side only.
 */
export async function GET(req: Request) {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const url = new URL(req.url);
  const attemptId = url.searchParams.get("attemptId") ?? "";
  const state = url.searchParams.get("state") ?? "";
  if (!attemptId || !state) {
    return NextResponse.json({ error: "Missing attemptId or state." }, { status: 400 });
  }
  const stateHash = createHash("sha256").update(state).digest("hex");
  await dbConnect();
  const attempt = await OAuthAttempt.findOne({ attemptId, ownerId: uid });
  if (!attempt || attempt.status !== "pending") {
    return NextResponse.json({ error: "Unknown or already-consumed OAuth attempt (replay protected)." }, { status: 400 });
  }
  if (!safeEqual(String(attempt.stateHash), stateHash)) {
    return NextResponse.json({ error: "Invalid OAuth state." }, { status: 400 });
  }
  if (attempt.expiresAt < new Date()) {
    await OAuthAttempt.updateOne({ _id: attempt._id }, { $set: { status: "expired" } });
    return NextResponse.json({ error: "OAuth attempt expired. Start again." }, { status: 400 });
  }
  // Mark consumed before any external exchange to prevent code replay.
  await OAuthAttempt.updateOne({ _id: attempt._id }, { $set: { status: "consumed", consumedAt: new Date() } });
  return NextResponse.json({
    ok: true,
    platform: attempt.platform,
    message: "Callback validated. Account discovery runs server-side via the Social SDK provider flow (see docs/social-sdk).",
  });
}
