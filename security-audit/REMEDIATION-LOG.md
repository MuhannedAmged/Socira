# Remediation log

Work was done in traceable increments on `master`:

| Commit | Scope |
|---|---|
| `afc8c9d` | Runtime fixes + 13 regression-test files (37 files, +839/−102) |
| `57a55f6` | Documentation aligned with actual behaviour (4 files) |
| `9f6240d` | Header regression test missed by the first staging path (`src/next-config.test.ts`) |
| `29d6bdc` | Audit artifacts (`security-audit/`) |
| _(this commit)_ | Coverage-log correction: records `9f6240d` and the final test count |

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
| F-08 | Narrow `connect-src` | `next.config.ts` | `src/next-config.test.ts` | Unit test |
| F-09 | Managed-bucket allowlist for service-role deletes | `src/lib/storage/supabase.ts`, media route, cron cleanup, workspace delete | `supabase.test.ts`, `media/route.test.ts` | Unit tests; cron/workspace paths reviewed |
| F-10 | 72-byte password cap | `src/lib/validation/schemas.ts` | `schemas.test.ts` | Unit test (ASCII + UTF-8) |
| F-11 | Fixed-length digest comparison | `src/lib/security/crypto.ts` | `crypto.test.ts` | Unit test |
| F-12 | Duplicate-key race → 409 | `src/app/api/auth/register/route.ts` | none | Code review only |
| F-13 | Roll back orphan post | `src/app/api/posts/route.ts` | `posts/route.test.ts` | Unit test |
| F-14 | Clear client user cache on logout/delete | `src/app/settings/page.tsx` | none | Code review only |
| F-15 | Redirect URI uses trusted origin | `src/lib/social/oauth.ts` | `oauth.test.ts` | Unit test |
| F-16 | Same-origin post-login redirect resolution | `src/lib/http/safe-redirect.ts`, `src/app/login/page.tsx` | `safe-redirect.test.ts` | Unit test |
| F-17 | Own-property check before error lookup | `src/app/accounts/page.tsx` | none | Code review only |
| F-18 | Correct documentation + deployment requirement (no code fix possible for signed uploads) | `docs/SECURITY.md`, `docs/DEPLOYMENT.md` | n/a | Reviewed |

## Documentation changes

- `docs/SECURITY.md`: corrected session revocation, reset-origin, CSRF, upload-byte, CSP, caching, and bucket-scope claims; expanded known limits (CSP `unsafe-inline`, copied-JWT logout, unenforced email verification, no re-auth on workspace deletion, URL tokens in logs, bucket-level upload enforcement).
- `docs/DEPLOYMENT.md`: `NEXT_PUBLIC_APP_URL` fail-closed behaviour and mandatory bucket `file_size_limit`/`allowed_mime_types`.
- `docs/ARCHITECTURE.md`: request flow now names `activeSessionUserId()` and `no-store`.
- `README.md`: security summary matches the controls and limits actually implemented.

## Verification performed

Run on 2026-10-27, on Windows, Node/npm as installed in the workspace:

| Gate | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Unit tests | `npx vitest run` | **17 files, 63 tests passed** |
| Production build | `npm run build` | exit 0, 39 routes generated |
| Dependency advisories | `npm audit` | 0 (info/low/moderate/high/critical) |
| Production dependencies | `npm audit --omit=dev` | 0 (info/low/moderate/high/critical) |

## Explicitly not verified

- No live signup/login/reset against a real MongoDB; the reset flow's atomicity is proven against a mocked Mongoose query, not a real server.
- No Supabase bucket was inspected or modified; signed upload size/MIME enforcement at the bucket is **assumed to be a deployment step**, not verified here.
- No live OAuth authorization, token exchange, refresh, revocation, or publish was executed. OAuth fixes are code/helper-tested only.
- No browser/DAST testing (CSRF, redirects, CSP behaviour, session expiry in a real browser).
- No coverage measurement; "tested" means the listed behaviour has an assertion, not that the file has full branch coverage.
- Third-party packages (including `@opencoredev/social-sdk`, `jose`, `mongoose`, `@supabase/supabase-js`, `resend`) were not audited line-by-line; see [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md).

## Rollback

Each commit is independent and revertible. Reverting `afc8c9d` restores the previous behaviour (including the findings); do not revert only the tests. The documentation commit can be reverted without affecting runtime.
