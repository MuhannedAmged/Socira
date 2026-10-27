/**
 * Resolve a post-login destination without allowing an open redirect.
 *
 * A prefix check (`startsWith("/")`, `!startsWith("//")`) is not enough: browsers normalize
 * backslashes, so `/\evil.example` resolves to `https://evil.example/`. Resolving against a known
 * origin and comparing the resulting origin handles that, encoded variants, and absolute URLs.
 *
 * The returned value is always a path on `origin`, never an absolute URL.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  origin: string,
  fallback = "/dashboard",
): string {
  if (!candidate) return fallback;
  try {
    const resolved = new URL(candidate, origin);
    if (resolved.origin !== origin) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
