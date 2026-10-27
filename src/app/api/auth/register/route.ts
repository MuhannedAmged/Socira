import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { EmailVerification } from "@/models/library";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey, crossOriginBlock } from "@/lib/http/request";
import { registerSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

function issueCode(): string {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
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
  let user;
  try {
    user = await User.create({ name, email, passwordHash, emailVerified: false });
  } catch (error) {
    // The pre-check above is not atomic; the unique index is. Report the same conflict instead of
    // surfacing a raw duplicate-key error.
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    throw error;
  }

  const code = issueCode();
  const codeHash = createHash("sha256").update(code).digest("hex");
  await EmailVerification.updateMany({ userId: user._id, consumedAt: null }, { $set: { consumedAt: new Date() } });
  await EmailVerification.create({
    userId: user._id,
    codeHash,
    expiresAt: new Date(Date.now() + 15 * 60_000),
  });
  await sendVerificationEmail(email, code);
  await createSession(String(user._id), Number(user.sessionVersion ?? 0));
  return NextResponse.json({ ok: true });
}
