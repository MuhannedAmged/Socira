# Residual risks

These are risks that remain **after** the remediation described in this report. They are either accepted with a documented rationale, dependent on deployment configuration, or outside what a static repository audit can prove. None of them is described as fixed.

| # | Risk | Severity | Why it remains | Operator action / rationale |
|---|---|---|---|---|
| R-01 | Rate limiting is in-memory and per instance | Medium (multi-instance) | A shared store (Redis) is not part of this stack | Use a shared limiter or edge rate limiting when running more than one instance |
| R-02 | `X-Forwarded-For` / `X-Real-IP` are caller-controlled unless the edge overwrites them | Low | The app deliberately accepts them for portability | Strip/overwrite at the trusted proxy; per-account limits still bound abuse |
| R-03 | Nonce CSP forces every page to render dynamically | Low (performance) | A static HTML shell has no request headers, so Next.js cannot attach a per-request nonce | Accept SSR cost or move to hash/SRI CSP; confirm CDN does not cache nonce-bearing HTML |
| R-04 | `img-src`/`media-src` allow any HTTPS host | Low | Provider avatars/media live on arbitrary CDNs | Tighten if all media becomes Supabase-hosted |
| R-05 | Logout revocation depends on the database | Low | The JWT is added to a `jti` denylist, but if MongoDB is unreachable the cookie is cleared and the copied token stays valid | Keep MongoDB highly available; password reset / `AUTH_SECRET` rotation still provide bulk revocation |
| R-06 | Email verification is enforced only when Resend is configured | Medium (product) | Turning the gate on without a working mail provider would lock every new account out of writes | Configure `RESEND_API_KEY` + `RESEND_FROM_EMAIL` in production; verify delivery before enabling |
| R-07 | Workspace deletion needs no fresh password confirmation | Low | Product decision; deletion already requires a live session | Add re-authentication for high-value deployments |
| R-08 | Reset tokens appear in the URL and may be logged by proxies | Low | Standard email-link flow | Redact `token` in edge/proxy logs; short 30-minute expiry limits exposure |
| R-09 | Uploads that are never recorded can still consume bucket storage | Medium | Post-upload validation runs only when the client calls `POST /api/media`; an abandoned signed upload leaves an unreferenced object | Set bucket `file_size_limit` / `allowed_mime_types` and a lifecycle cleanup policy; keep the bucket private |
| R-10 | Service-role Supabase key has broad project authority | High impact if leaked | Required for signed URLs and cleanup | Keep server-only, rotate on exposure, scope keys/projects where the provider allows |
| R-11 | Registration reveals whether an email exists (`409`) | Low | Deliberate honest UX; login timing is equalized but register is not | Return a neutral response if enumeration matters for the deployment |
| R-12 | Tokens issued before `jti` existed cannot be individually revoked | Low | Legacy tokens have no session id; logout can only clear their cookie | They expire within 14 days; password reset or `AUTH_SECRET` rotation invalidates them immediately |
| R-13 | OAuth behaviour depends on third-party SDK internals | Medium | State/PKCE/redirect checks are implemented inside `@opencoredev/social-sdk`; it was not line-by-line audited | Track SDK advisories; re-run the OAuth tests on upgrades; perform one live flow per provider before launch |
| R-14 | OAuth/token refresh/publishing are not live-verified | Medium | Only Instagram credentials exist locally and no real account was used | Run an authorized end-to-end connect + publish test with approved apps |
| R-15 | No DB-backed integration tests | Medium | Requires MongoDB/Supabase fixtures not present in this environment | Add integration tests for reset/login atomicity, `jti` logout revocation, verification attempts, and post-upload metadata |
| R-16 | No DAST/browser security testing | Medium | Static audit plus a production-mode header smoke test only | Run ZAP/browser tests against a staging deployment, especially CSRF, CSP, and redirects |
| R-17 | Nonce-bearing HTML must not be cached or replayed | Low | The nonce is per request, but a shared cache that reuses one HTML response would reuse its nonce | Ensure the CDN/host does not cache authenticated HTML; verify in staging |
| R-18 | Production reset/OAuth fail closed when `NEXT_PUBLIC_APP_URL` is missing or non-HTTPS | Low (availability) | Intentional: guessing an origin caused F-01 | Set the exact HTTPS origin in every environment |
| R-19 | No WAF, bot defence, or volumetric DDoS protection | Medium (ops) | Application-level only | Use the hosting provider's edge protections |
| R-20 | No security headers on error pages generated outside Next.js? | Low | Assumed covered by `headers()` for `/:path*`; not live-verified | Verify headers on 404/500 responses in staging |

## Confidence statement

- **High confidence:** the static code paths for authentication, password reset, tenant scoping, CSRF, redirects, nonce-based CSP generation, session revocation, and storage bucket scoping were read in full and the named tests pass. A production build served a CSP with a per-request nonce and matching `nonce` attributes, and rejected unauthenticated `/dashboard` requests.
- **Medium confidence:** behaviour that depends on MongoDB semantics (atomic `findOneAndUpdate`, unique indexes, `$inc`, TTL indexes) and on Supabase Storage's `info()` response. The code is correct by inspection and unit-mocked tests, but not integration-tested here.
- **Low confidence / unverified:** live OAuth provider behaviour, live email delivery, live Supabase upload verification, real-browser CSP enforcement, and third-party SDK internals.

This audit does **not** claim the project is vulnerability-free. It claims that the enumerated findings were addressed as described, that the coverage log is complete for the listed files, and that the remaining risks are the ones listed above.
