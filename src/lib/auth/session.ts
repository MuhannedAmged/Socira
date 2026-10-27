import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";

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
  const token = await new SignJWT({ sub: userId, sv: version })
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

async function readSession(): Promise<{ uid: string; sv: unknown } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? { uid: payload.sub, sv: payload.sv } : null;
  } catch {
    return null;
  }
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
  const user = await User.findById(session.uid).select("status sessionVersion").lean();
  if (!user || user.status !== "active") return null;
  if (!isCurrentSessionVersion(session.sv, user.sessionVersion)) return null;
  return session.uid;
}
