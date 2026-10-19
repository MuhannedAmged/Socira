import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { PasswordReset } from "@/models/library";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey, crossOriginBlock } from "@/lib/http/request";
import { forgotSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    // Neutral regardless.
    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  }
  if (
    !rateLimit(rateKey("forgot:ip", req), 10, 15 * 60_000).ok ||
    !rateLimit(rateKey("forgot:account", req, parsed.data.email), 4, 15 * 60_000).ok
  ) {
    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  }
  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await PasswordReset.create({ userId: user._id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60_000) });
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
    await sendPasswordResetEmail(parsed.data.email, `${base}/reset-password?token=${token}`);
  }
  return NextResponse.json({ message: "If an account exists, a reset link was sent." });
}
