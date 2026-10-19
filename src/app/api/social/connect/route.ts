import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { OAuthAttempt } from "@/models/OAuthAttempt";
import { activeSessionUserId } from "@/lib/auth/session";

export const runtime = "nodejs";

const ALLOWED = new Set(["instagram", "facebook", "youtube", "linkedin", "tiktok", "x"]);

function missingFor(platform: string): string[] {
  const map: Record<string, string[]> = {
    instagram: ["INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET"],
    facebook: ["META_APP_ID", "META_APP_SECRET"],
    youtube: ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
    linkedin: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
    tiktok: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    x: ["X_CLIENT_ID", "X_CLIENT_SECRET"],
  };
  return (map[platform] ?? []).filter((k) => !process.env[k]);
}

/** GET /api/social/connect?platform=x — creates a one-time attempt. Real redirect requires credentials. */
export async function GET(req: Request) {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") ?? "";
  if (!ALLOWED.has(platform)) {
    return NextResponse.json({ error: "Unsupported platform. Only instagram, facebook, youtube, linkedin, tiktok, x." }, { status: 400 });
  }
  const missing = missingFor(platform);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `OAuth is not configured for ${platform}. Missing: ${missing.join(", ")}. See .env.example and docs.`, missing },
      { status: 503 },
    );
  }
  await dbConnect();
  const attemptId = randomBytes(16).toString("hex");
  const state = randomBytes(24).toString("hex");
  const stateHash = createHash("sha256").update(state).digest("hex");
  await OAuthAttempt.create({
    ownerId: uid,
    platform,
    attemptId,
    stateHash,
    expiresAt: new Date(Date.now() + 10 * 60_000),
  });
  // Provider authorization URL construction is intentionally deferred to the
  // documented Social SDK provider factory for the installed version.
  // We return the attempt so the UI can continue once providers are wired.
  // The provider authorization URL must include `state`; the callback verifies it against
  // stateHash before consuming the attempt (OAuth CSRF protection).
  return NextResponse.json({
    ok: true,
    attemptId,
    state,
    message: "OAuth attempt created. Provider redirect is wired per docs/social-sdk platform guide.",
  });
}
