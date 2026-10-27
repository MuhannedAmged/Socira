import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { EmailVerification } from "@/models/library";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey, crossOriginBlock } from "@/lib/http/request";
import { verifySchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
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

  const now = new Date();
  // Claim an attempt atomically. The conditional update is what enforces the cap: concurrent
  // requests can never read the same pre-increment count and each slip past it.
  const record = await EmailVerification.findOneAndUpdate(
    {
      userId: user._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: 6 },
    },
    { $inc: { attempts: 1 } },
    { sort: { createdAt: -1 }, new: true },
  );
  if (!record) {
    const exhausted = await EmailVerification.exists({
      userId: user._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $gte: 6 },
    });
    if (exhausted) {
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const candidate = createHash("sha256").update(parsed.data.code).digest();
  const stored = Buffer.from(record.codeHash as string, "hex");
  const match = candidate.length === stored.length && timingSafeEqual(candidate, stored);
  if (!match) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });

  // Consume exactly once, even if two correct requests arrive together.
  const consumed = await EmailVerification.findOneAndUpdate(
    { _id: record._id, consumedAt: null },
    { $set: { consumedAt: new Date() } },
  );
  if (!consumed) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  await User.updateOne({ _id: user._id }, { $set: { emailVerified: true } });
  return NextResponse.json({ ok: true });
}
