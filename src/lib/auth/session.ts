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

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
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

export async function sessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * Session id that is also still allowed to act. A valid token is not enough: suspension must take
 * effect immediately instead of waiting up to 14 days for the JWT to expire.
 */
export async function activeSessionUserId(): Promise<string | null> {
  const uid = await sessionUserId();
  if (!uid) return null;
  await dbConnect();
  const user = await User.findById(uid).select("status").lean();
  return user?.status === "active" ? uid : null;
}
