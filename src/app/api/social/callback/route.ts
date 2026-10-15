import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { OAuthAttempt } from "@/models/OAuthAttempt";
import { sessionUserId } from "@/lib/auth/session";

export const runtime = "nodejs";

/** GET /api/social/callback?attemptId=… — validates one-time attempt. Code exchange happens server-side only. */
export async function GET(req: Request) {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const url = new URL(req.url);
  const attemptId = url.searchParams.get("attemptId") ?? "";
  if (!attemptId) return NextResponse.json({ error: "Missing attemptId." }, { status: 400 });
  await dbConnect();
  const attempt = await OAuthAttempt.findOne({ attemptId, ownerId: uid });
  if (!attempt || attempt.status !== "pending") {
    return NextResponse.json({ error: "Unknown or already-consumed OAuth attempt (replay protected)." }, { status: 400 });
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
