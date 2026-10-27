# Socira

Open-source social media management for **Instagram, Facebook, YouTube, LinkedIn, TikTok, and X** — one workspace to compose, schedule, publish, and measure, with connected accounts, encrypted credentials, per-destination publish receipts, and an honest capability registry instead of fake automation.

- **No subscriptions, paywalls, or premium tiers.**
- **Honest by default.** If a platform or an integration cannot do something, the UI says so rather than pretending it worked.

## What works today

| Area | Status |
| --- | --- |
| Email/password auth (register, verify, login, logout, password reset) | Working — bcrypt hashes, HttpOnly JWT sessions, hashed one-time codes |
| Account settings (profile, timezone, appearance, notification prefs, delete workspace) | Working — persisted per user |
| Post composer and destination selection | Working — drafts and planned posts stored with per-destination records |
| Connected accounts (list, disconnect, credential wipe) | Working |
| Media uploads (signed Supabase uploads, per-user paths) | Working with storage configured — images and videos are removed from storage 3 days after upload (`/api/cron/media-cleanup`) |
| Notifications (in-app list, mark read) | Working |
| OAuth connect / callback | Working when credentials are configured — real provider authorization URL, PKCE + state verification, server-side code exchange, account discovery, encrypted credential storage. Facebook reports unsupported because the installed SDK ships no OAuth provider for it |
| Publishing / scheduling execution | Not automated without a hosting cron. Queued destinations are reported as queued, never as published (`docs/SCHEDULING.md`) |
| Analytics | Not implemented — nothing is invented or estimated |

The full, per-platform matrix lives in `docs/PLATFORM-CAPABILITIES.md`.

## Tech stack

- **Next.js 16** App Router, TypeScript strict mode, React 19
- **Tailwind CSS v4** (CSS-first config, semantic tokens defined in `src/app/globals.css`)
- **`@tabler/icons-react`** icons, **Hanken Grotesk** typography, **motion** for micro-interactions
- **MongoDB / Mongoose** data layer, **jose** sessions, **bcryptjs** password hashing
- **Supabase Storage** for media, **Resend** for transactional email
- **`@opencoredev/social-sdk`** for provider integration
- **Vitest** for unit tests

## Quickstart

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

The app starts without any credentials — connections and publishing then report exactly what is missing instead of failing silently.

### Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Everything persisted | MongoDB connection string |
| `AUTH_SECRET` | Sessions | At least 32 characters of random data |
| `CREDENTIAL_ENCRYPTION_KEY` | Storing platform tokens | Exactly 32 bytes, base64 or hex: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXT_PUBLIC_APP_URL` | Reset links, callbacks | Exact HTTPS origin in production |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Verification and reset email | Resend sender must be a verified domain |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | Media uploads | Service-role key is server-only |
| `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` | YouTube | Per-platform OAuth app |
| `INSTAGRAM_CLIENT_ID` / `_SECRET` | Instagram | |
| `LINKEDIN_CLIENT_ID` / `_SECRET` | LinkedIn | |
| `LINKEDIN_API_VERSION` | LinkedIn | Explicit Marketing API version, `YYYYMM` (for example `202601`) |
| `TIKTOK_CLIENT_KEY` / `_SECRET` | TikTok | |
| `X_CLIENT_ID` / `_SECRET` | X | |
| `CRON_SECRET` | Scheduler and cleanup endpoints | Bearer token for `/api/cron/publish` and `/api/cron/media-cleanup` |

Register a callback URL in each platform console pointing at `https://your-app/api/social/callback`. Facebook is not connectable: `@opencoredev/social-sdk@0.5.0` has no Facebook OAuth provider, and the UI states that instead of offering a dead redirect.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
npm test         # vitest unit tests
npx tsc --noEmit # type check
```

## Project layout

```
src/app                 routes: marketing, auth flows, dashboard pages, API handlers
src/app/api/auth        register, verify, login, logout, password reset, me (profile + delete)
src/app/api/social      connect + callback (one-time attempts, state verification)
src/app/api/posts       create and list posts with per-destination records
src/app/api/accounts    list and disconnect connected accounts
src/app/api/media       signed upload URLs
src/app/api/cron        scheduler entry point
src/components          UI: dashboard shell, auth shell, motion primitives, ui kit
src/lib/auth            sessions, password hashing
src/lib/security        AES-256-GCM credential encryption
src/lib/social          capability registry
src/lib/validation      zod schemas shared by client forms and API handlers
src/models              Mongoose models
docs/                   architecture, security, deployment, scheduling, capabilities
```

## Security

Every request handler scopes its database queries to the session owner (`{ ownerId: uid }`), validated before any write. Highlights; the full threat model is in `docs/SECURITY.md`:

- Sessions are HttpOnly, SameSite=Lax JWTs; suspended accounts are rejected on every request rather than trusting a valid token for its 14-day lifetime. A password reset bumps a per-user session version, invalidating every session issued before it.
- Passwords use bcrypt (cost 12) and inputs are capped at bcrypt's 72-byte limit. Verification codes and reset tokens are stored only as SHA-256 hashes, are single-use, and expire (15 and 30 minutes).
- Reset links are built only from `NEXT_PUBLIC_APP_URL`; the request `Host` header is never trusted, and a missing/invalid origin fails closed instead of emailing an attacker-controlled link.
- Platform credentials are encrypted with AES-256-GCM. The key must decode to exactly 32 bytes; a malformed key is a hard error, never silently zero-padded.
- Login, registration, verification, resend, password-reset, media, post, and notification writes are rate limited per network origin and per account.
- OAuth attempts are one-time, expire in 10 minutes, and are consumed atomically. The SDK verifies `state` in constant time, enforces the exact redirect allowlist, and keeps the PKCE verifier server-side.
- The scheduler endpoint compares its secret in constant time and never marks work as published without a real worker.
- Responses include a Content-Security-Policy (`connect-src` limited to the app and configured Supabase origin) and hardening headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production). API responses are `no-store`.
- `CREDENTIAL_ENCRYPTION_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `CRON_SECRET` are server-only and belong in no `NEXT_PUBLIC_*` variable.

Known limits are listed in `docs/SECURITY.md` (per-instance rate limiter, CSP `unsafe-inline`, logout does not revoke an already-copied JWT, and email verification is recorded but not yet enforced).

Found a vulnerability? Open a private report via the repository's security advisories rather than a public issue.

## Testing

```bash
npm test
```

Unit tests cover the capability registry, credential crypto (including rejection of malformed keys), validation schemas, the same-origin (CSRF) guard, password-reset token atomicity and session revocation, reset-link origin handling, and ownership scoping for post destinations, account disconnection, and media deletion. Run `npx tsc --noEmit` and `npm run lint` before opening a pull request.

## Deployment

A production checklist (env vars, HTTPS, callback URLs, headers, cron) is in `docs/DEPLOYMENT.md`. Note that the in-memory rate limiter is per instance; a multi-instance deployment should put a shared store (for example Redis) behind it.

## Contributing

Keep changes honest: never report a platform action as successful when it did not actually happen, and mark unverified behaviour as unverified. Run `npx tsc --noEmit`, `npm run lint`, and `npm test` before opening a pull request.

## License

No license file is currently included. Until one is added, the default "all rights reserved" applies and the code may not be reused or redistributed. Add a `LICENSE` file (for example MIT) to change that.
