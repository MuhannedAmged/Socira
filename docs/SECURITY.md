# Security model

## Assumptions

- HTTPS in production, `HttpOnly` + `Secure` + `SameSite=Lax` session cookies, 14-day expiry, logout + password-reset invalidation.
- Attackers can craft requests, replay callbacks, and guess IDs — so every resource is re-resolved server-side and ownership-checked.

## Controls

- **Tenant isolation:** all queries scoped to `sessionUserId()`. Cross-user IDOR covered by tests.
- **OAuth:** per-attempt random state (SHA-256 stored), 10-min expiry, one-time consumption before code exchange, no trust in callback-supplied account IDs/tokens, exact redirect allowlists.
- **Credentials:** AES-256-GCM with server-only `CREDENTIAL_ENCRYPTION_KEY` + version; scopes + revision persisted; refresh is atomic with race protection; revocation prompts reconnect. Tokens never logged or sent to the browser.
- **Passwords:** bcryptjs (cost 12). Resets are random 256-bit tokens, SHA-256 hashed, 30-min single-use, rate-limited.
- **Email verification:** 6-digit numeric codes, SHA-256 hashed, 15-min expiry, resend + attempt caps, constant-time compare, neutral responses against enumeration.
- **Uploads:** private Supabase bucket, user-scoped paths, MIME allowlist + size caps, signed URLs; service-role key server-only; path traversal blocked by filename sanitization.
- **Abuse:** in-memory rate limits on auth/verify/reset; cron endpoint requires `CRON_SECRET` bearer; webhooks (where implemented) verify signatures on raw bytes with idempotent processing.
- **Errors/logs:** Zod at boundaries, safe client messages, no secrets in logs or API responses.

## Incident handling

Rotate `AUTH_SECRET` (forces logout), `CREDENTIAL_ENCRYPTION_KEY` (bump version, re-encrypt), OAuth client secrets, `CRON_SECRET`, and Supabase keys independently. Audit security-sensitive events in `AuditLog` without secrets.
