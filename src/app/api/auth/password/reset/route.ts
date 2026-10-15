import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { PasswordReset } from "@/models/library";
import { hashPassword } from "@/lib/auth/password";
import { destroySession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit/memory";
import { resetSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  if (!rateLimit(`reset:${parsed.data.token.slice(0, 8)}`, 8, 15 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }
  await dbConnect();
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await PasswordReset.findOne({ tokenHash, consumedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  const passwordHash = await hashPassword(parsed.data.password);
  await User.updateOne({ _id: record.userId }, { $set: { passwordHash } });
  await PasswordReset.updateOne({ _id: record._id }, { $set: { consumedAt: new Date() } });
  await PasswordReset.updateMany({ userId: record.userId, consumedAt: null }, { $set: { consumedAt: new Date() } });
  await destroySession();
  return NextResponse.json({ ok: true });
}
