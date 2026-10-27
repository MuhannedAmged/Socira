# Findings

- **Audit type:** static, adversarial source review of the whole project, plus dependency audit.
- **Not performed:** live DAST, authenticated browser testing against real accounts, MongoDB/Supabase-backed integration tests, or third-party penetration testing. Fixes are verified by unit tests with mocks and by the production build — **not** by live end-to-end exploitation.
- **Severity rubric:** Critical = direct unauthenticated takeover; High = authenticated takeover or cross-tenant impact; Medium = meaningful abuse with preconditions or defense-in-depth failure; Low = hardening/robustness.
- **Result:** 18 findings. 17 fixed (12 with automated regression tests, 5 code-reviewed only), 1 open but mitigated by deployment configuration. See [REMEDIATION-LOG.md](./REMEDIATION-LOG.md) and [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md).

## Summary

| ID | Severity | Area | Finding | Status |
|---|---|---|---|---|
| F-01 | High | Auth / email | Password-reset link origin derived from `Host`/`req.url` → token exfiltration | Fixed, tested |
| F-02 | High | Sessions | Password reset did not invalidate existing sessions | Fixed, tested |
| F-03 | Medium | Auth | Reset token validation and consumption were a TOCTOU race | Fixed, tested |
| F-04 | Medium | OAuth | Callback redirected using request origin → open redirect | Fixed, helper tested |
| F-05 | Low | CSRF | `PATCH /api/notifications` had no same-origin guard | Fixed, tested |
| F-06 | Low | Abuse | Create-post and mark-read writes lacked rate limits | Fixed, partially tested |
| F-07 | Low | Caching | API responses had no explicit `no-store` | Fixed, tested |
| F-08 | Medium | Headers | CSP allowed `connect-src https:` (any origin) | Fixed, tested |
| F-09 | Medium | Storage | Bucket name read from DB was passed to service-role deletes | Fixed, mostly tested |
| F-10 | Medium | Passwords | Inputs longer than bcrypt's 72-byte limit were accepted | Fixed, tested |
| F-11 | Low | Crypto | Secret comparison returned early on length mismatch | Fixed, tested |
| F-12 | Low | Registration | Duplicate-email race surfaced a raw error | Fixed, code-reviewed |
| F-13 | Low | Posts | Failed destination insert left an orphan post | Fixed, tested |
| F-14 | Low | Client | Cached user identity survived logout/workspace deletion | Fixed, code-reviewed |
| F-15 | Low | OAuth | Redirect URI allowed non-HTTPS/malformed bases in production | Fixed, tested |
| F-16 | Medium | Client | Post-login `next` check bypassable with backslashes | Fixed, tested |
| F-17 | Low | Client | Crafted `?error=` key could crash the accounts page | Fixed, code-reviewed |
| F-18 | Medium | Uploads | App cannot enforce actual bytes behind signed upload URLs | Open; documented, needs bucket config |

## Detailed findings

### F-01 — Password-reset link used the request origin

- **Baseline evidence:** `src/app/api/auth/password/forgot/route.ts` in `HEAD`:
  ```ts
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
  await sendPasswordResetEmail(parsed.data.email, `${base}/reset-password?token=${token}`);
  ```
- **Root cause:** `req.url`/`Host` are attacker-controlled on many deployments. With `NEXT_PUBLIC_APP_URL` unset, a request with `Host: attacker.example` produced a genuine reset link on the attacker's domain; the victim's click would deliver the one-time token to the attacker.
- **Fix:** new `src/lib/http/origin.ts` `configuredAppOrigin()` returns only the configured origin (HTTPS required in production, `null` otherwise). The forgot route never falls back; when no trusted origin exists it does not send and keeps the neutral response.
- **Verification:** `origin.test.ts` (5 cases) and `forgot/route.test.ts` (configured origin used; request Host never appears; no email when unset). **Not live-tested with an SMTP provider.**

### F-02 — Sessions survived a password reset

- **Baseline evidence:** `HEAD` reset route updated `passwordHash` only, then cleared the current browser cookie. Any other copied/active JWT remained valid for up to 14 days.
- **Root cause:** JWTs are stateless and had no revocation dimension.
- **Fix:** `User.sessionVersion`; `createSession` embeds `sv`; `activeSessionUserId()` compares the claim with the database; `consumePasswordReset()` increments the version with `$inc`. Tokens without `sv` are treated as version 0 so a normal deploy does not log everyone out.
- **Verification:** `session.test.ts` (legacy token behavior, mismatches, malformed claims) and `password-reset.test.ts` (version bump). **Not integration-tested against a real Mongo replica set.**

### F-03 — Reset-token TOCTOU

- **Baseline evidence:** `HEAD` reset route ran `PasswordReset.findOne(...)`, then `hashPassword(...)`, then `User.updateOne(...)`, then marked the token consumed. Two concurrent requests could both pass `findOne`.
- **Root cause:** validation and consumption were separate operations, with the expensive hash between them.
- **Fix:** `src/lib/auth/password-reset.ts` claims the token first with one `findOneAndUpdate({ tokenHash, consumedAt: null, expiresAt: { $gt: now } })`, then hashes, then updates the user, then invalidates sibling tokens.
- **Verification:** `password-reset.test.ts` includes a genuine two-call race asserting exactly one `"ok"` and one `"invalid"`, and that the password update runs once.

### F-04 — Open redirect after OAuth

- **Baseline evidence:** `HEAD` callback: `const url = new URL("/accounts", req.url);`.
- **Root cause:** result redirects inherited the request origin, so a forged `Host` could send users to an attacker-controlled `/accounts` URL (phishing/credential prompt), even though tokens stay server-side.
- **Fix:** `backToApp()` uses `configuredAppOrigin()` and returns `503` if it is unavailable. The SDK still enforces the exact redirect allowlist during code exchange.
- **Verification:** `origin.test.ts`; callback flow code-reviewed. **OAuth was not exercised live** because only Instagram credentials exist locally and no real authorization was performed.

### F-05 — CSRF on notification updates

- **Baseline evidence:** `HEAD` `PATCH` signature was `export async function PATCH()` with no origin check and no body.
- **Root cause:** the handler relied only on `SameSite=Lax`; a proxy/browser edge case or a future cookie-policy change would permit cross-site state change.
- **Fix:** `crossOriginBlock(req)` plus a per-user rate limit. The update remains `{ ownerId: uid, read: false }`.
- **Verification:** `notifications/route.test.ts` (cross-origin → 403 and no DB call; same-origin → owner-scoped update).

### F-06 — Missing rate limits on writes

- **Baseline evidence:** `HEAD` `POST /api/posts` and `PATCH /api/notifications` had no limiter.
- **Root cause:** auth endpoints were limited, but authenticated write endpoints were not.
- **Fix:** 20 posts/minute per user+IP and 60 mark-reads/minute per user+IP.
- **Verification:** notifications limiter covered indirectly by the route test; **the posts limiter has no dedicated assertion** (code-reviewed only).

### F-07 — Cacheable authenticated API responses

- **Baseline evidence:** `next.config.ts` set security headers for all paths but no cache policy for `/api/*`.
- **Root cause:** route handlers returned JSON without `Cache-Control`; shared caches/CDNs could retain authenticated responses if configured to cache.
- **Fix:** `/api/:path*` now sends `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, `Pragma: no-cache`, `Expires: 0`.
- **Verification:** `src/next-config.test.ts` asserts the rule and values.

### F-08 — Over-broad CSP `connect-src`

- **Baseline evidence:** `HEAD` CSP contained `connect-src 'self' https:`.
- **Root cause:** any HTTPS destination was allowed, so an injected script could exfiltrate to an arbitrary host.
- **Fix:** `connect-src` is now `'self'` plus the configured Supabase origin (plus `ws:`/`wss:` in development only). Changing `SUPABASE_URL` requires a rebuild/restart because the config is evaluated then.
- **Verification:** `src/next-config.test.ts` asserts `'self'` is present and the blanket `https:` form is gone.

### F-09 — Database bucket value reached the service-role client

- **Baseline evidence:** `HEAD` media delete used `storage.from(asset.bucket)`; cron grouped expired rows by `asset.bucket` and deleted from each; workspace deletion iterated stored buckets.
- **Root cause:** bucket names were treated as authority. A corrupted/tampered row could direct a service-role delete at an unrelated bucket.
- **Fix:** `isManagedBucket()` / `storageBucket()` allowlist. Media delete skips foreign buckets; cron queries only the managed bucket; workspace deletion queries only the managed bucket.
- **Verification:** `supabase.test.ts`, `media/route.test.ts` (foreign bucket → storage delete never called; managed bucket → called). Cron and workspace-delete paths are code-reviewed only.

### F-10 — bcrypt 72-byte truncation

- **Baseline evidence:** `HEAD` schemas capped passwords at 128 characters, not bytes.
- **Root cause:** bcrypt only considers the first 72 bytes; two long passwords sharing a prefix authenticate interchangeably.
- **Fix:** byte-length refinement on register and reset schemas; reset token also capped at 256 chars.
- **Verification:** `schemas.test.ts` covers 73 ASCII bytes, 74 UTF-8 bytes (37 `é`), and exactly 72 bytes.

### F-11 — Length leak in constant-time comparison

- **Baseline evidence:** `HEAD` `safeEqual` returned `false` immediately when buffer lengths differed.
- **Root cause:** the early return leaks the expected secret's length; `timingSafeEqual` also rejects unequal buffers.
- **Fix:** SHA-256 both operands first, then compare fixed-length digests.
- **Verification:** `crypto.test.ts` (equal, near-equal, different-length).

### F-12 — Duplicate-email registration race

- **Baseline evidence:** `HEAD` register route checked `findOne` then called `User.create` without handling `E11000`.
- **Root cause:** check-then-create is not atomic; the unique index is.
- **Fix:** `11000` is mapped to the same `409` response as the pre-check.
- **Verification:** code-reviewed only; **no register route test** (mocking Mongoose duplicate-key errors would not prove the real index behavior).

### F-13 — Orphan post after destination failure

- **Baseline evidence:** `HEAD` `Post.create(...)` was followed by `PostDestination.insertMany(...)` with no rollback.
- **Root cause:** two writes without a transaction or compensating action.
- **Fix:** on insert failure, delete the just-created post with `{ _id, ownerId: uid }` and return `500`.
- **Verification:** `posts/route.test.ts` asserts rollback and owner scoping.

### F-14 — Stale client identity after logout/deletion

- **Baseline evidence:** `HEAD` settings page navigated after logout/deletion without clearing the module-level `useCurrentUser` cache.
- **Root cause:** cached profile data is process-wide in the browser tab and survived navigation.
- **Fix:** `setCurrentUser(null)` before redirecting in both flows.
- **Verification:** code-reviewed only; **no browser test** for this client state.

### F-15 — OAuth callback URI accepted weak bases

- **Baseline evidence:** `HEAD` `oauthRedirectUri()` accepted any parseable `NEXT_PUBLIC_APP_URL`, including `http://` in production.
- **Root cause:** redirect construction did not share the trusted-origin policy used for reset links.
- **Fix:** it now uses `configuredAppOrigin()`, so production requires HTTPS and malformed values fail closed (`503` in the connect route).
- **Verification:** `oauth.test.ts` (HTTPS accepted; missing, malformed, and production-HTTP rejected).

### F-16 — Post-login open redirect via backslashes

- **Baseline evidence:** `HEAD` login page:
  ```ts
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  router.push(target);
  ```
- **Root cause:** prefix checks do not normalize. Under the URL parser, `/\evil.example` resolves to `https://evil.example/`, so a crafted `/login?next=/\evil.example` could redirect off-site after a successful login.
- **Fix:** `src/lib/http/safe-redirect.ts` resolves the candidate against `window.location.origin` and returns only same-origin path+query+hash, otherwise `/dashboard`.
- **Verification:** `safe-redirect.test.ts` covers absolute, protocol-relative, `javascript:`, backslash, doubled-backslash, and malformed inputs.

### F-17 — Prototype-key lookup could crash the accounts page

- **Baseline evidence:** `HEAD` accounts page used `OAUTH_ERRORS[error as string] ?? "..."` with `error` taken from the URL.
- **Root cause:** a plain object inherits `__proto__`/`constructor`; a crafted `?error=__proto__` yields a non-string that React cannot render.
- **Fix:** `Object.hasOwn(OAUTH_ERRORS, error)` before indexing.
- **Verification:** code-reviewed only (client rendering, no component test harness).

### F-18 — Signed uploads are not byte-validated by the app

- **Evidence:** `src/app/api/media/sign/route.ts` checks the **declared** `mime`/`size`, then mints a Supabase signed upload URL. `src/app/api/media/route.ts` trusts the later declared metadata when recording the asset.
- **Root cause:** the browser uploads directly to Supabase; the app never sees the bytes and cannot enforce a limit on them.
- **Impact:** an authenticated user can exceed the UI limits or upload a different content type than declared, subject to the bucket's own settings. Files are served from the Supabase origin via signed URLs, not from the app origin.
- **Status:** **Open by design of signed uploads.** Mitigation is deployment configuration: set the bucket's `file_size_limit` and `allowed_mime_types`. `docs/SECURITY.md` and `docs/DEPLOYMENT.md` now state this explicitly instead of claiming byte-level enforcement.
- **Verification:** code path reviewed; bucket settings were not inspected because no live Supabase project was used.

## Checks that did not produce findings

- **IDOR/tenant isolation:** every collection query is scoped by `ownerId`/`userId` resolved from the session; body-supplied IDs are re-checked. Destructive handlers use atomic owner-scoped `findOneAndDelete`/`deleteMany`.
- **NoSQL injection:** Mongo filters receive Zod-parsed strings/booleans/enums, not raw objects; no `$where` or object spread from request bodies into filters.
- **XSS:** no `dangerouslySetInnerHTML`, no `eval`, no raw HTML injection; React escapes rendered provider/user content. CSP provides a second layer (with the documented `unsafe-inline` caveat).
- **SSRF:** the server never fetches a user-supplied URL. Storage operations address `SUPABASE_URL` with server-derived paths.
- **OAuth replay/state forgery:** attempts are owner-scoped, expire, are claimed atomically for discovery, and are consumed atomically; the SDK owns constant-time state/PKCE checks.
- **Cron authorization:** both cron routes require `CRON_SECRET` with a constant-time comparison; `/api/cron/publish` does not publish anything and says so.
- **Secret handling:** no service-role/auth/encryption/Resend/cron secret is referenced from client modules or `NEXT_PUBLIC_*`; `.env.local` was never tracked.
- **Webhook spoofing:** no webhook receiver is implemented, so there is no signature to bypass (nothing to claim).
- **Dependencies:** `npm audit` and `npm audit --omit=dev` both report 0 advisories; no lifecycle/install scripts in `package.json`.
