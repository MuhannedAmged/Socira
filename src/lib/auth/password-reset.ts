import { createHash } from "node:crypto";
import { PasswordReset } from "@/models/library";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";

export type PasswordResetResult = "ok" | "invalid";

/**
 * Consume a reset token atomically and rotate the password.
 *
 * Order matters: the token is claimed with a single `findOneAndUpdate` before any expensive
 * hashing, so two concurrent requests cannot both pass validation. The user document update also
 * increments `sessionVersion`, invalidating every session issued before the reset.
 */
export async function consumePasswordReset(token: string, newPassword: string): Promise<PasswordResetResult> {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await PasswordReset.findOneAndUpdate(
    { tokenHash, consumedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { consumedAt: new Date() } },
  ).lean();
  if (!record) return "invalid";

  const passwordHash = await hashPassword(newPassword);
  const updated = await User.updateOne(
    { _id: record.userId },
    { $set: { passwordHash }, $inc: { sessionVersion: 1 } },
  );
  if (updated.matchedCount !== 1) return "invalid";

  // A reset invalidates every other outstanding link for the same account.
  await PasswordReset.updateMany(
    { userId: record.userId, consumedAt: null },
    { $set: { consumedAt: new Date() } },
  );
  return "ok";
}
