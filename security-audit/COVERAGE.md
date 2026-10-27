# Coverage log

Scope: every tracked file plus every untracked working-tree file that belongs to the project. Count: **126** (117 at the first audit pass plus 9 files added by the follow-up fixes).

- **R** marks a file changed by this audit.
- Generated/vendor trees (`node_modules/`, `.next/`, `coverage/`) are not project source; they are covered by `npm audit` plus the lockfile review, not by a false line-by-line claim.
- The files in `security-audit/` are this audit's output, not inputs; they are not part of the 126 project files.
- Ignored local files `.env.local`, `PROJECT.md`, and `SOCIAL-SDK.md` are handled in [FILE-INVENTORY.md](./FILE-INVENTORY.md#ignored-local-files).

| File | Coverage status | R |
|---|---|---|
| `.env.example` | Reviewed: names only; values are empty placeholders | 
| `.gitignore` | Reviewed: secret/build ignore rules | 
| `AGENTS.md` | Reviewed: documented claims checked against code | 
| `docs/ARCHITECTURE.md` | Reviewed: documented claims checked against code | **R**
| `docs/DEPLOYMENT.md` | Reviewed: documented claims checked against code | **R**
| `docs/PLATFORM-CAPABILITIES.md` | Reviewed: documented claims checked against code | 
| `docs/SCHEDULING.md` | Reviewed: documented claims checked against code | 
| `docs/SECURITY.md` | Reviewed: documented claims checked against code | **R**
| `docs/SOCIAL-SDK-IMPLEMENTATION.md` | Reviewed: documented claims checked against code | 
| `eslint.config.mjs` | Reviewed: build/test configuration | 
| `next.config.ts` | Security-reviewed: HSTS, cache and hardening headers; static CSP removed | **R**
| `package.json` | Reviewed: scripts, direct dependencies, no install hooks | 
| `package-lock.json` | Bulk dependency analysis (npm audit all/prod + direct-dependency review); not read line-by-line | 
| `README.md` | Reviewed: documented claims checked against code | **R**
| `src/app/accounts/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | **R**
| `src/app/analytics/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/api/accounts/route.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/app/api/accounts/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, verified-session gate | **R**
| `src/app/api/auth/login/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/auth/logout/route.ts` | Security-reviewed: CSRF guard, `jti` revocation, cookie clearing | **R**
| `src/app/api/auth/me/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/auth/password/forgot/route.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/app/api/auth/password/forgot/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/auth/password/reset/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/auth/register/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/auth/verify/resend/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | 
| `src/app/api/auth/verify/route.test.ts` | Reviewed; added in this audit; executed (Vitest) | **R**
| `src/app/api/auth/verify/route.ts` | Security-reviewed: CSRF, rate limits, atomic attempt cap and single consumption | **R**
| `src/app/api/cron/media-cleanup/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/cron/publish/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | 
| `src/app/api/media/route.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/app/api/media/route.ts` | Security-reviewed: ownership, bucket allowlist, post-upload size/MIME verification, verified-session gate | **R**
| `src/app/api/media/sign/route.ts` | Security-reviewed: authn/authz, shared allowlist, verified-session gate | **R**
| `src/app/api/notifications/route.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/app/api/notifications/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/posts/route.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/app/api/posts/route.ts` | Security-reviewed: authn/authz, ownership rollback, verified-session gate | **R**
| `src/app/api/social/callback/route.ts` | Security-reviewed: authn/authz, CSRF, input validation, error handling | **R**
| `src/app/api/social/connect/route.ts` | Security-reviewed: authn/authz, rate limits, verified-session gate | **R**
| `src/app/calendar/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/compose/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/dashboard/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/docs/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/favicon.ico` | Inspected as a static binary icon; no server/client code path, not parsed | 
| `src/app/forgot-password/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/globals.css` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/inbox/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/layout.tsx` | Reviewed: rendering, nonce-compatible dynamic rendering | **R**
| `src/app/login/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | **R**
| `src/app/media/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/notifications/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/posts/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/privacy/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/register/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/reset-password/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/settings/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | **R**
| `src/app/terms/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/app/verify/page.tsx` | Reviewed: rendering, user data exposure, client redirects, forms | 
| `src/components/auth/auth-shell.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/dashboard/page-header.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/layout/dashboard-shell.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/layout/site-footer.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/layout/site-header.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/motion/pressable.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/motion/reveal.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/theme-provider.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/theme-toggle.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/ui/badge.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/ui/button.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/ui/card.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/ui/empty-state.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/ui/input.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/components/ui/switch.tsx` | Reviewed: rendering/XSS, props, no secret access | 
| `src/config/platforms.tsx` | Reviewed: static platform metadata; no security surface | 
| `src/lib/auth/password.ts` | Security-reviewed: sessions, password hashing, reset flow | 
| `src/lib/auth/password-reset.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/auth/password-reset.ts` | Security-reviewed: sessions, password hashing, reset flow | **R**
| `src/lib/auth/session-revocation.test.ts` | Reviewed; added in this audit; executed (Vitest) | **R**
| `src/lib/auth/session.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/auth/session.ts` | Security-reviewed: sessions, `jti` revocation, password reset | **R**
| `src/lib/auth/verification.test.ts` | Reviewed; added in this audit; executed (Vitest) | **R**
| `src/lib/auth/verification.ts` | Security-reviewed: conditional email-verification gate | **R**
| `src/lib/db/mongoose.ts` | Security-reviewed: connection reuse and failure behaviour | 
| `src/lib/ease.ts` | Reviewed: client-only state/motion/class helpers; no security surface | 
| `src/lib/email/resend.ts` | Security-reviewed: provider config, no token logging | 
| `src/lib/env.ts` | Security-reviewed: env presence checks only; no values exposed | 
| `src/lib/hooks/use-current-user.ts` | Reviewed: client-only state/motion/class helpers; no security surface | 
| `src/lib/hooks/use-hover-capable.ts` | Reviewed: client-only state/motion/class helpers; no security surface | 
| `src/lib/hooks/use-sidebar-state.ts` | Reviewed: client-only state/motion/class helpers; no security surface | 
| `src/lib/http/csp.test.ts` | Reviewed; added in this audit; executed (Vitest) | **R**
| `src/lib/http/csp.ts` | Security-reviewed: nonce CSP construction and origin allowlist | **R**
| `src/lib/http/origin.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/http/origin.ts` | Security-reviewed: origin/CSRF, rate keys, safe redirects | **R**
| `src/lib/http/request.test.ts` | Reviewed; executed (Vitest) | 
| `src/lib/http/request.ts` | Security-reviewed: origin/CSRF, rate keys, safe redirects | **R**
| `src/lib/http/safe-redirect.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/http/safe-redirect.ts` | Security-reviewed: origin/CSRF, rate keys, safe redirects | **R**
| `src/lib/media/constraints.test.ts` | Reviewed; added in this audit; executed (Vitest) | **R**
| `src/lib/media/constraints.ts` | Security-reviewed: upload MIME allowlist and per-type caps | **R**
| `src/lib/media/retention.test.ts` | Reviewed; executed (Vitest) | 
| `src/lib/media/retention.ts` | Security-reviewed: retention filters and expiry | 
| `src/lib/rate-limit/memory.ts` | Security-reviewed: limiter bounds, keying, sweep | 
| `src/lib/security/crypto.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/security/crypto.ts` | Security-reviewed: AES-GCM, key parsing, constant-time compare | **R**
| `src/lib/social/capabilities.test.ts` | Reviewed; executed (Vitest) | 
| `src/lib/social/capabilities.ts` | Security-reviewed: OAuth state/PKCE, credential sink, capability claims | 
| `src/lib/social/connection-store.ts` | Security-reviewed: OAuth state/PKCE, credential sink, capability claims | 
| `src/lib/social/oauth.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/social/oauth.ts` | Security-reviewed: OAuth state/PKCE, credential sink, capability claims | **R**
| `src/lib/storage/supabase.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/storage/supabase.ts` | Security-reviewed: bucket scoping and path handling | **R**
| `src/lib/utils.ts` | Reviewed: client-only state/motion/class helpers; no security surface | 
| `src/lib/validation/schemas.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/lib/validation/schemas.ts` | Security-reviewed: boundary schemas and normalization | **R**
| `src/models/Credential.ts` | Security-reviewed: schema fields, indexes, uniqueness, select rules | 
| `src/models/library.ts` | Security-reviewed: schema fields, indexes, uniqueness, select rules | 
| `src/models/OAuthAttempt.ts` | Security-reviewed: schema fields, indexes, uniqueness, select rules | 
| `src/models/Post.ts` | Security-reviewed: schema fields, indexes, uniqueness, select rules | 
| `src/models/Session.ts` | Security-reviewed: `jti` uniqueness and TTL expiry | **R**
| `src/models/SocialAccount.ts` | Security-reviewed: schema fields, indexes, uniqueness, select rules | 
| `src/models/User.ts` | Security-reviewed: schema fields, indexes, uniqueness, select rules | **R**
| `src/next-config.test.ts` | Reviewed; added/updated in this audit; executed (Vitest) | **R**
| `src/proxy.ts` | Security-reviewed: route gating, token verification, per-request CSP nonce | **R**
| `tsconfig.json` | Reviewed: build/test configuration | 
| `vitest.config.ts` | Reviewed: build/test configuration | 
