import { activeSessionUserId } from "@/lib/auth/session";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";

/**
 * Email verification is enforced only when a mail provider is actually configured. Turning the
 * gate on without a working provider would permanently lock every new account out of product
 * operations, so unconfigured deployments keep the previous behaviour.
 */
export function emailVerificationEnforced(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export interface VerifiedSession {
  uid: string;
  emailVerified: boolean;
}

/**
 * Session identity plus the email-verification state. Returns null when there is no live session.
 * `emailVerified` is reported as true when enforcement is disabled, because no product write is
 * gated in that configuration.
 */
export async function verifiedSession(): Promise<VerifiedSession | null> {
  const uid = await activeSessionUserId();
  if (!uid) return null;
  if (!emailVerificationEnforced()) return { uid, emailVerified: true };
  await dbConnect();
  const user = await User.findById(uid).select("emailVerified").lean();
  if (!user) return null;
  return { uid, emailVerified: Boolean(user.emailVerified) };
}

export const EMAIL_UNVERIFIED_ERROR = "Verify your email before using this feature.";
