import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey } from "@/lib/http/request";
import { loginSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
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
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || user.status !== "active") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash as string);
  if (!ok) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await createSession(String(user._id));
  return NextResponse.json({ ok: true, verified: Boolean(user.emailVerified) });
}
