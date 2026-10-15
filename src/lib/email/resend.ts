import { Resend } from "resend";

export function resendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(to: string, code: string) {
  const client = resendClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "";
  if (!client || !from) {
    console.warn("[email] Resend not configured — skipping verification email.");
    return { skipped: true };
  }
  if (process.env.NODE_ENV === "test") return { skipped: true };
  await client.emails.send({
    from,
    to,
    subject: "Your Socira verification code",
    text: `Your Socira verification code is ${code}. It expires in 15 minutes.`,
  });
  return { skipped: false };
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const client = resendClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "";
  if (!client || !from) {
    console.warn("[email] Resend not configured — skipping password reset email.");
    return { skipped: true };
  }
  if (process.env.NODE_ENV === "test") return { skipped: true };
  await client.emails.send({
    from,
    to,
    subject: "Reset your Socira password",
    text: `Reset your password: ${url}. This link expires in 30 minutes and is single-use.`,
  });
  return { skipped: false };
}
