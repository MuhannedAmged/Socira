/**
 * The app's public origin, used for links and redirects that must never be derived from
 * request headers. `Host` is attacker-controlled on many deployments, so falling back to
 * `new URL(req.url).origin` in a password-reset email would let an attacker mail a victim a
 * valid reset token pointing at the attacker's domain (token exfiltration).
 *
 * In production the configured value must be HTTPS. Returning `null` is intentional: callers
 * must refuse to build a privileged link rather than guess an origin.
 */
export function configuredAppOrigin(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = (env.NEXT_PUBLIC_APP_URL ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && env.NODE_ENV === "production") return null;
    return url.origin;
  } catch {
    return null;
  }
}
