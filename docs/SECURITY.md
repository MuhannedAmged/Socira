# Security model

## Assumptions

- HTTPS in production, `HttpOnly` + `Secure` + `SameSite=Lax` session cookies, 14-day expiry, logout + password-reset invalidation.
- Attackers can craft requests, replay callbacks, and guess IDs — so every resource is re-resolved server-side and ownership-checked.

## Controls

- **Tenant isolation:** all queries scoped to the session owner. Cross-user IDOR covered by tests.
- **Sessions:** `AUTH_SECRET` must be ≥ 32 characters; the JWT is verified with an explicit `HS256` allowlist. `src/proxy.ts` cheaply validates the token before any dashboard route renders and redirects unauthenticated visitors to `/login?next=…`; authentication is never trusted from the proxy alone. Account status is re-checked in every route handler, so suspension takes effect immediately instead of waiting for the 14-day token to expire.
- **OAuth:** the Social SDK generates 256-bit state and a PKCE verifier per attempt; the verifier and provider state stay server-side. The callback's `state` is compared in constant time, the attempt is owner-scoped and expires in 10 minutes, code exchange is claimed atomically before any network call, and the exact redirect URI is enforced against an allowlist. Callback-supplied account IDs and tokens are never trusted; discovered accounts must match the stored attempt.
- **Credentials:** AES-256-GCM with a server-only `CREDENTIAL_ENCRYPTION_KEY` that must decode to exactly 32 bytes (a malformed key throws rather than being zero-padded) plus a key version; scopes + revision persisted; refresh is atomic with race protection; revocation prompts reconnect. Tokens never logged or sent to the browser.
- **Passwords:** bcryptjs (cost 12). A missing account is compared against a fixed dummy hash so login timing cannot be used to enumerate registered emails. Resets are random 256-bit tokens, SHA-256 hashed, 30-minute single-use, rate-limited. Reset links fall back to the request origin when `NEXT_PUBLIC_APP_URL` is unset. `passwordHash` is `select: false` in the schema, so it is never returned unless a query explicitly opts in.
- **CSRF:** session cookies are `SameSite=Lax`, and every state-changing handler additionally rejects a request whose `Origin`/`Referer` is not the app's own origin. Requests with neither header (cron, native clients) carry no ambient cookie and are unaffected.
- **Email verification:** 6-digit numeric codes, SHA-256 hashed, 15-minute expiry, resend + attempt caps, constant-time compare, neutral responses against enumeration.
- **Uploads:** private Supabase bucket, user-scoped paths, MIME allowlist with per-type size caps (25 MB images, 512 MB video), signed URLs, per-user upload rate limit; service-role key server-only; path traversal blocked by filename sanitization. Assets expire 3 days after upload and are deleted from storage before their database record, so a failed storage call stays retryable. The cleanup endpoint is bearer-only and compares `CRON_SECRET` in constant time.
- **Abuse:** rate limits on auth/verify/reset/media keyed by network origin *and* by account, so neither a single IP nor a single account can be brute-forced and spoofed forwarding headers do not remove the per-account ceiling. The limiter itself is bounded and sweeps expired entries. The cron endpoint compares `CRON_SECRET` in constant time; webhooks (where implemented) verify signatures on raw bytes with idempotent processing.
- **Transport/headers:** a Content-Security-Policy (no `https:` in `script-src`, `frame-ancestors 'none'`, `object-src 'none'`) plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and HSTS in production. `X-Powered-By` is disabled. No `unsafe-eval` outside development.
- **Audit:** workspace deletion purges owned documents and records the deletion event after the purge, so the event survives while user data does not.
- **Errors/logs:** Zod at boundaries, safe client messages, no secrets in logs or API responses.

## Known limits

- The rate limiter is in-memory and therefore per instance; use a shared store for multi-instance deployments.
- `X-Forwarded-For` is caller-controlled unless a trusted proxy overwrites it. The per-account limits bound the impact; set `TRUSTED_PROXY`-style header stripping at the edge for strict IP accounting.
- `unsafe-inline` remains in `script-src` because Next.js emits inline bootstrap scripts without a nonce; moving to nonce-based CSP requires a middleware change.


## Incident handling

Rotate `AUTH_SECRET` (forces logout), `CREDENTIAL_ENCRYPTION_KEY` (bump version, re-encrypt), OAuth client secrets, `CRON_SECRET`, and Supabase keys independently. Audit security-sensitive events in `AuditLog` without secrets.
