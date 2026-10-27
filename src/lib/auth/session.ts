import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { RevokedSession } from "@/models/Session";

const COOKIE = "socira_session";
export const SESSION_COOKIE = COOKIE;
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days
const MIN_SECRET_LENGTH = 32;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET ?? "";
  if (!s) throw new Error("AUTH_SECRET is not configured.");
  if (s.length < MIN_SECRET_LENGTH) {
    throw new Error(`AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters of random data.`);
  }
  return new TextEncoder().encode(s);
}

/**
 * Version comparison for session revocation. Tokens issued before `sessionVersion` existed
 * carry no claim and are treated as version 0; bumping the user's document therefore invalidates
 * every previously issued token without logging out users during an ordinary deploy.
 */
export function isCurrentSessionVersion(tokenValue: unknown, currentValue: unknown): boolean {
  const token = typeof tokenValue === "number" && Number.isSafeInteger(tokenValue) ? tokenValue : 0;
  const current = typeof currentValue === "number" && Number.isSafeInteger(currentValue) ? currentValue : 0;
  return token === current;
}

export async function createSession(userId: string, sessionVersion = 0) {
  const version =
    typeof sessionVersion === "number" && Number.isSafeInteger(sessionVersion) ? sessionVersion : 0;
  // `jti` allows logout to revoke exactly this token without invalidating other devices.
  const token = await new SignJWT({ sub: userId, sv: version, jti: randomUUID() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

interface SessionClaims {
  uid: string;
  sv: unknown;
  jti: string | null;
  exp: number | null;
}

async function readSession(): Promise<SessionClaims | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return {
      uid: payload.sub,
      sv: payload.sv,
      jti: typeof payload.jti === "string" ? payload.jti : null,
      exp: typeof payload.exp === "number" ? payload.exp : null,
    };
  } catch {
    return null;
  }
}

/**
 * Add the current token to the logout denylist before the cookie is cleared. Legacy tokens issued
 * before `jti` existed cannot be revoked individually; those remain valid until they expire unless
 * the user's session version is bumped (password reset) or `AUTH_SECRET` is rotated.
 */
export async function revokeCurrentSession(): Promise<boolean> {
  const session = await readSession();
  if (!session?.jti) return false;
  const expiresAt = session.exp
    ? new Date(session.exp * 1000)
    : new Date(Date.now() + MAX_AGE * 1000);
  await dbConnect();
  await RevokedSession.updateOne(
    { jti: session.jti },
    { $setOnInsert: { jti: session.jti, expiresAt } },
    { upsert: true },
  );
  return true;
}

export async function sessionUserId(): Promise<string | null> {
  return (await readSession())?.uid ?? null;
}

/**
 * Session id that is also still allowed to act. A valid token is not enough:
 * - suspension must take effect immediately instead of waiting up to 14 days for the JWT;
 * - a password reset bumps `sessionVersion`, so every token issued before it stops working.
 */
export async function activeSessionUserId(): Promise<string | null> {
  const session = await readSession();
  if (!session) return null;
  await dbConnect();
  const [user, revoked] = await Promise.all([
    User.findById(session.uid).select("status sessionVersion").lean(),
    session.jti ? RevokedSession.exists({ jti: session.jti }) : Promise.resolve(null),
  ]);
  if (!user || user.status !== "active") return null;
  if (revoked) return null;
  if (!isCurrentSessionVersion(session.sv, user.sessionVersion)) return null;
  return session.uid;
}
