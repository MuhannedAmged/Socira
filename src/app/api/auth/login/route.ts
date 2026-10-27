import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { AuditLog } from "@/models/library";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit/memory";
import { crossOriginBlock, rateKey } from "@/lib/http/request";
import { loginSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

/**
 * A valid bcrypt hash (cost 12) that no password matches. Comparing against it when the account is
 * unknown keeps the response time of "user exists" and "user does not exist" alike, so login cannot
 * be used as a fast account-enumeration oracle.
 */
const TIMING_EQUALIZER = "$2b$12$ZoxXSoBl/AeFGHFlvByCwecGL3e4xGHLA/w6NjTQ2C/8rhJ5i8u5m";

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  if (!rateLimit(rateKey("login:ip", req), 20, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }
  if (!rateLimit(rateKey("login:account", req, parsed.data.email), 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }
  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
  const hash = (user?.passwordHash as string | undefined) ?? TIMING_EQUALIZER;
  const ok = await verifyPassword(parsed.data.password, hash);
  if (!user || user.status !== "active" || !ok) {
    if (user) {
      // Only recorded once the email is known, so the log holds no data about unknown addresses.
      await AuditLog.create({ ownerId: user._id, event: "auth.login_failed", meta: {} }).catch(() => {});
    }
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await createSession(String(user._id), Number(user.sessionVersion ?? 0));
  await AuditLog.create({ ownerId: user._id, event: "auth.login", meta: {} }).catch(() => {});
  return NextResponse.json({ ok: true, verified: Boolean(user.emailVerified) });
}
