import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { OAuthAttempt } from "@/models/OAuthAttempt";
import { activeSessionUserId } from "@/lib/auth/session";
import { configuredAppOrigin } from "@/lib/http/origin";
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
 * Where the platform sends the browser back. The base is the configured public origin, never
 * `req.url`, so a forged Host header cannot turn an OAuth result into an open redirect.
 */
function backToApp(params: Record<string, string>): NextResponse {
  const origin = configuredAppOrigin();
  if (!origin) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL is not configured, so the result cannot be redirected safely." },
      { status: 503 },
    );
  }
  const url = new URL("/accounts", origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

/**
 * GET /api/social/callback?code=…&state=…
 *
 * The SDK verifies state (constant-time), expiry, ownership, PKCE, and the redirect
 * allowlist, then exchanges the code server-side. Discovery persists encrypted
 * credentials; `select` consumes the attempt and issues grants. Every failure is a
 * redirect with a code — never a silent success.
 */
export async function GET(req: Request) {
  const uid = await activeSessionUserId();
  if (!uid) return backToApp({ error: "session_required" });

  const state = new URL(req.url).searchParams.get("state") ?? "";
  if (!state) return backToApp({ error: "invalid_state" });

  await dbConnect();
  const attempt = await OAuthAttempt.findOne({ state, ownerId: uid, consumedAt: null });
  if (!attempt) return backToApp({ error: "unknown_attempt" });

  const platform = attempt.platforms[0] ?? "";
  const support = platformSupport(platform);
  if (!support.ok) return backToApp({ error: "unconfigured" });

  const redirectUri = oauthRedirectUri();
  if (!redirectUri) return backToApp({ error: "app_url_missing" });

  const manager = newConnectionManager();
  const provider = buildProvider(support.config, credentialSink);
  const scope = { attemptId: attempt.attemptId, tenantId: uid, principalId: uid };

  try {
    const accounts = await manager.discover({
      ...scope,
      callbackUrl: req.url,
      returnedState: state,
      allowedRedirectUris: [redirectUri],
      provider,
    });
    const grants = await manager.select({
      ...scope,
      selectedAccountIds: accounts.map((account) => account.ref.accountId),
    });
    return backToApp({ connected: String(grants.length) });
  } catch (error) {
    return backToApp({ error: errorCode(error) });
  }
}
