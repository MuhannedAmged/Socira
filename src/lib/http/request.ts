import { NextResponse } from "next/server";

/**
 * Coarse request metadata for rate limiting.
 *
 * X-Forwarded-For is caller-controlled unless a trusted proxy overwrites it. We still accept it
 * (Vercel, Fly, Cloudflare and nginx all set it), but we take only the first hop and never trust
 * the raw header as a userId. Without a trusted proxy the address is advisory only, which is why
 * the per-account limits exist alongside it.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return "unknown";
}

/** Rate-limit key combining the network origin with a stable per-identity dimension. */
export function rateKey(scope: string, req: Request, identity?: string): string {
  const ip = clientIp(req);
  return identity ? `${scope}:${ip}:${identity.slice(0, 120).toLowerCase()}` : `${scope}:${ip}`;
}

function selfOrigins(req: Request): Set<string> {
  const allowed = new Set<string>();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      allowed.add(new URL(appUrl).origin);
    } catch {
      // Malformed NEXT_PUBLIC_APP_URL — fall back to the request host below.
    }
  }
  const host = req.headers.get("host");
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }
  return allowed;
}

/**
 * CSRF guard for state-changing requests. Cookies are SameSite=Lax, so a cross-site POST cannot
 * attach them in modern browsers; this closes the remaining gap for browsers or proxies that do
 * send the cookie. Requests with no Origin or Referer (native clients, cron, curl) are allowed —
 * they carry no ambient session cookie that an attacker could ride.
 */
export function crossOriginBlock(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  let source = origin;
  const referer = req.headers.get("referer");
  if (!source && referer) {
    try {
      source = new URL(referer).origin;
    } catch {
      source = null;
    }
  }
  if (!source) return null;
  if (selfOrigins(req).has(source)) return null;
  return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
}
