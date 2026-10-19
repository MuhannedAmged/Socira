/**
 * Coarse request metadata for rate limiting.
 *
 * X-Forwarded-For is caller-controlled unless a trusted proxy overwrites it. We still accept it
 * (Vercel, Fly, Cloudflare and nginx all set it), but we take only the first hop and never trust
 * the raw header as a userId. `TRUSTED_PROXY=true` documents that the deployment strips spoofed
 * headers; without one the address is advisory only, so limits are backed by per-account keys too.
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
