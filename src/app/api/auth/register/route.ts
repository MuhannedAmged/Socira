import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { EmailVerification } from "@/models/library";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey } from "@/lib/http/request";
import { registerSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

function issueCode(): string {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

export async function POST(req: Request) {
  if (!rateLimit(rateKey("register", req), 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  await dbConnect();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    // Neutral-ish but honest: account exists.
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, emailVerified: false });

  const code = issueCode();
  const codeHash = createHash("sha256").update(code).digest("hex");
  await EmailVerification.updateMany({ userId: user._id, consumedAt: null }, { $set: { consumedAt: new Date() } });
  await EmailVerification.create({
    userId: user._id,
    codeHash,
    expiresAt: new Date(Date.now() + 15 * 60_000),
  });
  await sendVerificationEmail(email, code);
  await createSession(String(user._id));
  return NextResponse.json({ ok: true });
}
