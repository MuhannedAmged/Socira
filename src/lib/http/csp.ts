/** Parse an origin without letting a malformed value break the proxy. */
function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export interface CspOptions {
  isDev?: boolean;
  supabaseUrl?: string;
}

/**
 * Nonce-based CSP for HTML responses. The proxy generates a fresh nonce per request and Next.js
 * applies it to its own bootstrap scripts. `style-src` keeps `'unsafe-inline'` because the app
 * uses inline style attributes (theme/motion); scripts are nonce-gated and `'unsafe-inline'` is
 * never present in production.
 */
export function buildContentSecurityPolicy(nonce: string, options: CspOptions = {}): string {
  const isDev = options.isDev ?? process.env.NODE_ENV !== "production";
  const supabaseOrigin = originOf(options.supabaseUrl ?? process.env.SUPABASE_URL);
  const connectSources = [
    "'self'",
    ...(supabaseOrigin ? [supabaseOrigin] : []),
    ...(isDev ? ["ws:", "wss:"] : []),
  ].join(" ");

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
}
