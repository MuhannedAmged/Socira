import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { activeSessionUserId } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey } from "@/lib/http/request";
import { OAUTH_BACKEND } from "@/lib/social/connection-store";
import {
  buildProvider,
  credentialSink,
  errorCode,
  newConnectionManager,
  oauthRedirectUri,
  platformSupport,
} from "@/lib/social/oauth";

export const runtime = "nodejs";

/**
 * GET /api/social/connect?platform=x — begins a real OAuth connection.
 *
 * The Social SDK generates state + PKCE, persists the attempt (including the verifier,
 * which never leaves the server) and returns the provider authorization URL. When
 * credentials are missing the response names the exact variables instead of pretending
 * a redirect exists.
 */
export async function GET(req: Request) {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!rateLimit(rateKey("social:connect", req, uid), 20, 60_000).ok) {
    return NextResponse.json({ error: "Too many connection attempts. Try again shortly." }, { status: 429 });
  }

  const platform = new URL(req.url).searchParams.get("platform") ?? "";
  const support = platformSupport(platform);
  if (!support.ok) {
    return NextResponse.json(
      { error: support.error, missing: support.missing ?? [] },
      { status: support.missing ? 503 : 400 },
    );
  }

  const redirectUri = oauthRedirectUri();
  if (!redirectUri) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL is not set, so the OAuth callback URL cannot be registered. See .env.example." },
      { status: 503 },
    );
  }

  await dbConnect();
  try {
    const start = await newConnectionManager().begin({
      backend: OAUTH_BACKEND,
      tenantId: uid,
      principalId: uid,
      platforms: [platform],
      capabilities: ["oauth"],
      redirectUri,
      allowedRedirectUris: [redirectUri],
      provider: buildProvider(support.config, credentialSink),
    });
    return NextResponse.json({
      ok: true,
      authorizationUrl: start.authorizationUrl,
      expiresAt: start.attempt.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not start the OAuth authorization request.", code: errorCode(error) },
      { status: 502 },
    );
  }
}
