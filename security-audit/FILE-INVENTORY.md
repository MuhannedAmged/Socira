# File inventory

- **Repository:** `Socira` (Next.js 16 App Router, TypeScript strict, MongoDB/Mongoose, Supabase Storage, Resend, `@opencoredev/social-sdk`).
- **Revision audited:** `master`, starting at `64d3e3c`; fixes and artifacts are in `afc8c9d`, `57a55f6`, `9f6240d`, `29d6bdc`, `4e4a54a`, `f962179`, and `0abcd47`.
- **Inventory date:** 2026-10-27.
- **Counted project files:** 126 (117 at the first pass + 9 source/test files added by the follow-up fixes). Total ~15,490 lines.
- **Per-file status:** see [COVERAGE.md](./COVERAGE.md). Every counted file has an explicit status; none is silently skipped.

## Group summary

| Group | Files | Lines | Security relevance | Treatment |
|---|---:|---:|---|---|
| API route handlers (`src/app/api/**/route.ts`) | 17 | 1,067 | Authentication, authorization, CSRF, input validation, rate limits, storage/OAuth boundaries | Full security review; targeted regression tests |
| App Router pages/styles (`src/app/**`) | 22 | 2,310 | Rendered data, client redirects, form handling, CSP interaction | Full review for XSS, open redirect, data exposure |
| React components (`src/components/**`) | 15 | 727 | Rendering, accessibility, client state | Full review; no secret access or raw HTML |
| Libraries (`src/lib/**`, excluding tests) | 25 | 1,163 | Session/crypto/validation/rate-limit/OAuth/storage/verification core | Full security review; most likely place for root causes |
| Mongoose models (`src/models/**`) | 7 | 206 | Ownership fields, uniqueness, indexes, `select` rules, TTL denylist | Full schema review |
| Middleware (`src/proxy.ts`) | 1 | 61 | Route gating and per-request CSP nonce | Full review (cheap signature check only) |
| Static config (`src/config/**`) | 1 | 33 | Platform labels/limits | Reviewed; no security surface |
| Root/config files | 9 | 8,644 | Build, dependencies, env template, ignore rules | Reviewed; `package-lock.json` bulk-analyzed |
| Documentation | 7 | 215 | Claims about implemented controls | Reviewed line-by-line and corrected where overstated |
| Tests (`*.test.ts`) | 22 | 1,069 | Regression evidence | Reviewed and executed (93 tests) |

## Notable file-level notes

- `next.config.ts` — HSTS, `X-Frame-Options`, `nosniff`, Referrer/Permissions policy, `no-store` for `/api/*`; static CSP removed in favour of the proxy nonce.
- `src/proxy.ts` — redirects unauthenticated protected routes, generates a per-request CSP nonce, and is explicitly **not** the authorization boundary.
- `src/lib/http/csp.ts` — nonce CSP construction, narrow `connect-src`, no inline scripts.
- `src/lib/auth/session.ts` — JWT issue/verify, `sessionVersion` and `jti` revocation, account-status check on every protected API call.
- `src/lib/auth/verification.ts` — conditional email-verification gate for product writes.
- `src/models/Session.ts` — `jti` denylist with a TTL index that follows token expiry.
- `src/lib/media/constraints.ts` — shared upload MIME allowlist and per-type size caps.
- `src/lib/auth/password-reset.ts` — atomic reset-token claim, password rotation, session-version bump, sibling-token invalidation.
- `src/lib/http/origin.ts` — trusted app origin; never derived from `Host`.
- `src/lib/http/request.ts` — CSRF origin allowlist and rate-limit keying.
- `src/lib/http/safe-redirect.ts` — same-origin post-login redirect resolution (rejects scheme-relative/backslash payloads).
- `src/lib/security/crypto.ts` — AES-256-GCM, strict 32-byte key parsing, constant-time compare over fixed-length digests.
- `src/lib/storage/supabase.ts` — service-role client, bucket default/trim, managed-bucket allowlist, filename sanitization. Upload metadata is verified through `storage.info()` in `src/app/api/media/route.ts`.
- `src/lib/social/oauth.ts`, `connection-store.ts` — provider config, redirect allowlist, state/PKCE persistence, atomic attempt consumption, encrypted credential sink.
- `src/lib/validation/schemas.ts` — boundary validation, email normalization, bcrypt 72-byte cap.
- `src/models/User.ts` — `passwordHash: select:false`, `sessionVersion`, account status.
- `package-lock.json` — 8,430 lines; **not** read line-by-line. Covered by `npm audit` (all and prod: 0 advisories) and direct-dependency review in `package.json`.
- `src/app/favicon.ico` — 15,086-byte static icon; no code path, not parsed as an executable asset.

## Ignored local files

These are present locally but are not part of the tracked project. They are listed so the audit does not look like it skipped them.

| Path | State | Handling |
|---|---|---|
| `.env.local` | Ignored, 1,399 bytes | Checked that it is ignored and absent from git history; inspected **variable names/presence only**. Values were never printed, copied, or written to any report/log. |
| `PROJECT.md` | Ignored, ~48 KB specification | Read for intended requirements (auth, reset, IDOR, OAuth replay, SSRF, uploads, logging). Used as a requirements source, not as evidence that a control exists. |
| `SOCIAL-SDK.md` | Ignored, ~20 KB SDK reference | Read for OAuth/security contracts referenced by the implementation. |
| `next-env.d.ts` | Generated by Next.js | Build artifact; not project logic. |
| `tsconfig.tsbuildinfo` | Generated incremental cache | Build artifact; no source content. |
| `.next/` | Build output | Generated; exercised by the production build, not reviewed as source. |
| `node_modules/` | Vendor tree | Covered by `npm audit` + lockfile analysis. |

## Repository/history checks

- `git log --all -- .env.local` returns nothing: no local env file was ever committed.
- No `.github/`, Docker, Terraform, Kubernetes, or deployment scripts exist in the repository.
- `public/` is absent/empty; no static uploads are served from the app origin.
- No secret-like literals were found in tracked source; `.env.example` contains empty placeholders only.
- The audit fixes and tests are committed as `f962179`; documentation and audit artifacts are in `0abcd47`. See [REMEDIATION-LOG.md](./REMEDIATION-LOG.md).
