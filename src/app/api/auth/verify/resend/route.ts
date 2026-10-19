import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { EmailVerification } from "@/models/library";
import { sendVerificationEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit/memory";
import { rateKey, crossOriginBlock } from "@/lib/http/request";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email().transform((s) => s.trim().toLowerCase()) });

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  if (
    !rateLimit(rateKey("resend:ip", req), 10, 10 * 60_000).ok ||
    !rateLimit(rateKey("resend:account", req, parsed.data.email), 3, 10 * 60_000).ok
  ) {
    return NextResponse.json({ error: "Too many resends. Wait a few minutes." }, { status: 429 });
  }
  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || user.emailVerified) {
    // Neutral to prevent enumeration.
    return NextResponse.json({ message: "If an unverified account exists, a new code was sent." });
  }
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const codeHash = createHash("sha256").update(code).digest("hex");
  await EmailVerification.updateMany({ userId: user._id, consumedAt: null }, { $set: { consumedAt: new Date() } });
  await EmailVerification.create({ userId: user._id, codeHash, expiresAt: new Date(Date.now() + 15 * 60_000) });
  await sendVerificationEmail(parsed.data.email, code);
  return NextResponse.json({ message: "If an unverified account exists, a new code was sent." });
}
