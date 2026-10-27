# Residual risks

These are risks that remain **after** the remediation in `afc8c9d`. They are either accepted with a documented rationale, dependent on deployment configuration, or outside what a static repository audit can prove. None of them is described as fixed.

| # | Risk | Severity | Why it remains | Operator action / rationale |
|---|---|---|---|---|
| R-01 | Rate limiting is in-memory and per instance | Medium (multi-instance) | A shared store (Redis) is not part of this stack | Use a shared limiter or edge rate limiting when running more than one instance |
| R-02 | `X-Forwarded-For` / `X-Real-IP` are caller-controlled unless the edge overwrites them | Low | The app deliberately accepts them for portability | Strip/overwrite at the trusted proxy; per-account limits still bound abuse |
| R-03 | CSP still needs `'unsafe-inline'` for scripts | Medium | Next.js emits inline bootstrap scripts without a nonce | Move to nonce/hash-based CSP with a middleware/proxy change |
| R-04 | `img-src`/`media-src` allow any HTTPS host | Low | Provider avatars/media live on arbitrary CDNs | Tighten if all media becomes Supabase-hosted |
| R-05 | Logout does not revoke an already-copied JWT | Medium | Stateless JWT; only password reset (session version) or `AUTH_SECRET` rotation revokes | Shorten `MAX_AGE`, add a per-session denylist if immediate logout is required |
| R-06 | Email verification is recorded but not enforced | Medium (product) | Enforcing it without a configured mail provider would lock users out | Configure Resend, then require `emailVerified` for product operations |
| R-07 | Workspace deletion needs no fresh password confirmation | Low | Product decision; deletion already requires a live session | Add re-authentication for high-value deployments |
| R-08 | Reset tokens appear in the URL and may be logged by proxies | Low | Standard email-link flow | Redact `token` in edge/proxy logs; short 30-minute expiry limits exposure |
| R-09 | Signed uploads bypass app-side byte checks (F-18) | Medium | The browser uploads directly to Supabase; the app never sees the bytes | Set bucket `file_size_limit` and `allowed_mime_types`; keep the bucket private |
| R-10 | Service-role Supabase key has broad project authority | High impact if leaked | Required for signed URLs and cleanup | Keep server-only, rotate on exposure, scope keys/projects where the provider allows |
| R-11 | Registration reveals whether an email exists (`409`) | Low | Deliberate honest UX; login timing is equalized but register is not | Return a neutral response if enumeration matters for the deployment |
| R-12 | Verification-attempt counter increments non-atomically | Low | Concurrent requests can exceed the per-record cap slightly; rate limits bound the total | Make the increment conditional if strict caps are required |
| R-13 | OAuth behaviour depends on third-party SDK internals | Medium | State/PKCE/redirect checks are implemented inside `@opencoredev/social-sdk`; it was not line-by-line audited | Track SDK advisories; re-run the OAuth tests on upgrades; perform one live flow per provider before launch |
| R-14 | OAuth/token refresh/publishing are not live-verified | Medium | Only Instagram credentials exist locally and no real account was used | Run an authorized end-to-end connect + publish test with approved apps |
| R-15 | No DB-backed integration tests | Medium | Requires MongoDB/Supabase fixtures not present in this environment | Add integration tests for reset atomicity, session-version revocation, and bucket cleanup |
| R-16 | No DAST/browser security testing | Medium | Static audit only | Run ZAP/browser tests against a staging deployment, especially CSRF, CSP, and redirects |
| R-17 | `connect-src` is computed at config evaluation time | Low | `next.config.ts` reads `SUPABASE_URL` during build/start | Rebuild/restart after changing Supabase configuration |
| R-18 | Production reset/OAuth fail closed when `NEXT_PUBLIC_APP_URL` is missing or non-HTTPS | Low (availability) | Intentional: guessing an origin caused F-01 | Set the exact HTTPS origin in every environment |
| R-19 | No WAF, bot defence, or volumetric DDoS protection | Medium (ops) | Application-level only | Use the hosting provider's edge protections |
| R-20 | No security headers on error pages generated outside Next.js? | Low | Assumed covered by `headers()` for `/:path*`; not live-verified | Verify headers on 404/500 responses in staging |

## Confidence statement

- **High confidence:** the static code paths for authentication, password reset, tenant scoping, CSRF, redirects, CSP configuration, and storage bucket scoping were read in full and the named tests pass.
- **Medium confidence:** behaviour that depends on MongoDB semantics (atomic `findOneAndUpdate`, unique indexes, `$inc`) and on Supabase Storage policy. The code is correct by inspection and unit-mocked tests, but not integration-tested here.
- **Low confidence / unverified:** live OAuth provider behaviour, live email delivery, real browser CSP enforcement, and third-party SDK internals.

This audit does **not** claim the project is vulnerability-free. It claims that the enumerated findings were addressed as described, that the coverage log is complete for the listed files, and that the remaining risks are the ones listed above.
