import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { EmailVerification } from "@/models/library";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey } from "@/lib/http/request";
import { verifySchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and 6-digit code." }, { status: 400 });
  }
  if (
    !rateLimit(rateKey("verify:ip", req), 20, 10 * 60_000).ok ||
    !rateLimit(rateKey("verify:account", req, parsed.data.email), 8, 10 * 60_000).ok
  ) {
    return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
  }
  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email });
  // Neutral response to reduce enumeration, but still actionable.
  if (!user) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  const record = await EmailVerification.findOne({
    userId: user._id,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  if (!record) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  if ((record.attempts as number) >= 6) {
    return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
  }
  const candidate = createHash("sha256").update(parsed.data.code).digest();
  const stored = Buffer.from(record.codeHash as string, "hex");
  const match = candidate.length === stored.length && timingSafeEqual(candidate, stored);
  await EmailVerification.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
  if (!match) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  await EmailVerification.updateOne({ _id: record._id }, { $set: { consumedAt: new Date() } });
  await User.updateOne({ _id: user._id }, { $set: { emailVerified: true } });
  return NextResponse.json({ ok: true });
}
