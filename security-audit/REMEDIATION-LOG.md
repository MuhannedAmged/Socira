# Remediation log

Work was done in traceable increments on `master`:

| Commit | Scope |
|---|---|
| `afc8c9d` | Runtime fixes + 13 regression-test files (37 files, +839/−102) |
| `57a55f6` | Documentation aligned with actual behaviour (4 files) |
| `9f6240d` | Header regression test missed by the first staging path (`src/next-config.test.ts`) |
| `29d6bdc` | Audit artifacts (`security-audit/`) |
| `4e4a54a` | Coverage-log correction: records `9f6240d` and the final test count |
| `f962179` | Remaining five fixes: post-upload verification, atomic attempts, `jti` logout, verification gate, nonce CSP (24 files, +907/−116) |
| `ecd0b72` | Security docs and audit artifacts updated for the new controls (10 files) |

All fixes are source changes; no production database, bucket, or live provider was modified. No secrets were read or written during remediation.

## Change map

| Finding | Change | Files | Regression test | Verification |
|---|---|---|---|---|
| F-01 | Trusted-origin helper; forgot route never falls back to `Host` | `src/lib/http/origin.ts`, `src/app/api/auth/password/forgot/route.ts` | `origin.test.ts`, `forgot/route.test.ts` | Unit tests + typecheck |
| F-02 | `sessionVersion` claim + DB check + `$inc` on reset | `src/lib/auth/session.ts`, `src/lib/auth/password-reset.ts`, `src/models/User.ts`, login/register routes | `session.test.ts`, `password-reset.test.ts` | Unit tests; no live Mongo |
| F-03 | Atomic token claim before hashing | `src/lib/auth/password-reset.ts`, reset route | `password-reset.test.ts` (concurrency) | Unit test with mocked store |
| F-04 | Callback redirects via configured origin | `src/app/api/social/callback/route.ts` | `origin.test.ts` | Code review + helper tests |
| F-05 | CSRF + rate limit on `PATCH /api/notifications` | `src/app/api/notifications/route.ts` | `notifications/route.test.ts` | Unit test |
| F-06 | Rate limits on post creation and mark-read | `src/app/api/posts/route.ts`, notifications route | posts test covers ownership/rollback; limiter code-reviewed | Unit test + review |
| F-07 | `no-store` for all API responses | `next.config.ts` | `src/next-config.test.ts` | Unit test |
| F-08 | Narrow `connect-src`; CSP moved to a per-request nonce policy | `src/lib/http/csp.ts`, `src/proxy.ts` | `csp.test.ts`, `next-config.test.ts` | Unit tests + production header smoke test |
| F-09 | Managed-bucket allowlist for service-role deletes | `src/lib/storage/supabase.ts`, media route, cron cleanup, workspace delete | `supabase.test.ts`, `media/route.test.ts` | Unit tests; cron/workspace paths reviewed |
| F-10 | 72-byte password cap | `src/lib/validation/schemas.ts` | `schemas.test.ts` | Unit test (ASCII + UTF-8) |
| F-11 | Fixed-length digest comparison | `src/lib/security/crypto.ts` | `crypto.test.ts` | Unit test |
| F-12 | Duplicate-key race → 409 | `src/app/api/auth/register/route.ts` | none | Code review only |
| F-13 | Roll back orphan post | `src/app/api/posts/route.ts` | `posts/route.test.ts` | Unit test |
| F-14 | Clear client user cache on logout/delete | `src/app/settings/page.tsx` | none | Code review only |
| F-15 | Redirect URI uses trusted origin | `src/lib/social/oauth.ts` | `oauth.test.ts` | Unit test |
| F-16 | Same-origin post-login redirect resolution | `src/lib/http/safe-redirect.ts`, `src/app/login/page.tsx` | `safe-redirect.test.ts` | Unit test |
| F-17 | Own-property check before error lookup | `src/app/accounts/page.tsx` | none | Code review only |
| F-18 | Post-upload `storage.info()` size/MIME verification; delete on mismatch | `src/app/api/media/route.ts`, `src/lib/media/constraints.ts`, `src/app/api/media/sign/route.ts` | `media/route.test.ts`, `constraints.test.ts` | Unit tests; no live Supabase |
| R-03 | Per-request nonce CSP; static CSP removed; pages forced dynamic | `src/lib/http/csp.ts`, `src/proxy.ts`, `next.config.ts`, `src/app/layout.tsx` | `csp.test.ts`, `next-config.test.ts` | Unit tests + build + `curl` header/nonce check |
| R-05 | `jti` session claim + TTL logout denylist | `src/lib/auth/session.ts`, `src/models/Session.ts`, logout route | `session-revocation.test.ts` | Unit tests; no live Mongo |
| R-06 | Verified-session gate on product writes when Resend is configured | `src/lib/auth/verification.ts`, posts/media/sign/accounts/social-connect routes | `verification.test.ts`, `posts/route.test.ts` | Unit tests |
| Verification cap | Atomic conditional attempt increment + single consumption | `src/app/api/auth/verify/route.ts` | `auth/verify/route.test.ts` | Unit tests |

## Documentation changes

- `docs/SECURITY.md`: corrected session revocation, reset-origin, CSRF, upload verification, nonce CSP, caching, and bucket-scope claims; documents the remaining limits (style-only `unsafe-inline`, DB dependency for logout revocation, verification only when Resend is configured, no re-auth on workspace deletion, URL tokens in logs, bucket-level limits for abandoned uploads).
- `docs/DEPLOYMENT.md`: `NEXT_PUBLIC_APP_URL` fail-closed behaviour; bucket `file_size_limit`/`allowed_mime_types` as defence-in-depth; Resend configuration now also enables the product-write verification gate.
- `docs/ARCHITECTURE.md`: request flow now includes the proxy and nonce CSP, `verifiedSession()`, and the `jti` denylist; model/module lists updated.
- `README.md`: security summary matches the controls and limits actually implemented.

## Verification performed

Run on 2026-10-27, on Windows, Node/npm as installed in the workspace:

| Gate | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Unit tests | `npx vitest run` | **22 files, 93 tests passed** |
| Production build | `npm run build` | exit 0, 39 routes generated |
| Dependency advisories | `npm audit` | 0 (info/low/moderate/high/critical) |
| Production dependencies | `npm audit --omit=dev` | 0 (info/low/moderate/high/critical) |

Runtime smoke test (production server on port 3100): `/` returned `200` with a CSP containing `script-src 'self' 'nonce-…' 'strict-dynamic'` and matching `nonce="…"` attributes; two requests received different nonces; `/docs` returned `200` without a login redirect; `/dashboard` returned `307` to `/login`. No browser CSP report or authenticated flow was exercised.

## Explicitly not verified

- No live signup/login/reset against a real MongoDB. Atomic reset, `jti` logout revocation, and verification-attempt caps are proven against mocked Mongoose queries, not a real server or replica set.
- No live Supabase project was used. Post-upload size/MIME verification is tested against mocked `storage.info()` responses; the real bucket's `info()` payload and TTL/lifecycle behaviour were not inspected.
- No live OAuth authorization, token exchange, refresh, revocation, or publish was executed. OAuth fixes are code/helper-tested only.
- No live Resend delivery was performed, so the email-verification gate was not exercised end-to-end with a real inbox.
- No full browser/DAST testing (CSRF, redirects, session expiry, CSP violations in a real browser). A production-mode smoke test confirmed a fresh nonce per request, matching `nonce` attributes, and a redirect from `/dashboard`; it did not run a browser CSP report.
- No coverage measurement; "tested" means the listed behaviour has an assertion, not that the file has full branch coverage.
- Third-party packages (including `@opencoredev/social-sdk`, `jose`, `mongoose`, `@supabase/supabase-js`, `resend`) were not audited line-by-line; see [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md).

## Rollback

Each commit is independent and revertible. Reverting `f962179` restores the previous upload/verification/logout/CSP behaviour; reverting `afc8c9d` restores the earlier findings. Do not revert only the tests. The documentation commit can be reverted without affecting runtime.
