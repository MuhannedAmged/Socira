# Architecture

Modular monolith in one Next.js App Router app. Server Components by default; `"use client"` only for interactivity (forms, composer, theme toggle, motion).

## Request flow

Browser → Route Handler (`src/app/api/**`, Node.js runtime) → `sessionUserId()` (jose HS256, HttpOnly/Lax) → `dbConnect()` (Mongoose, connection reuse) → ownership-scoped query (`ownerId`) → Zod validation → service (social/storage/email) → JSON response with safe errors.

## Modules

- `lib/auth` — bcryptjs passwords, jose sessions, rate limits on auth endpoints.
- `models` — User, SocialAccount, OAuthAttempt, Credential (encrypted), Post + PostDestination, MediaAsset, Notification, EmailVerification, PasswordReset, AuditLog.
- `lib/security/crypto` — AES-256-GCM with `CREDENTIAL_ENCRYPTION_KEY` + version for rotation.
- `lib/social` — capability registry (`capabilities.ts`), provider config/factory (`oauth.ts`), and the MongoDB `ConnectionStore` (`connection-store.ts`). Real SDK flow: state + PKCE in Mongo, server-side code exchange, encrypted `Credential` upsert in the credential sink. `MemoryConnectionStore` is never production persistence.
- `lib/storage` — Supabase private bucket, user-scoped paths, signed upload URLs. Service-role key server-only.
- `lib/email` — Resend verification codes (hashed, 15-min, single-use, attempt-capped) + password resets (SHA-256 hashed, 30-min, single-use).

## Tenant isolation

Every protected query filters by the session user id resolved server-side. IDs from the browser are never trusted as ownership proof. Social operations re-resolve the account, verify `ownerId`, check capabilities/scopes, then call the SDK with `connectedAccountRef` from trusted records.

## Scheduling

No Inngest/Trigger/QStash. Native scheduling only where the adapter supports it (YouTube, partial). Otherwise a hosting cron calls `GET /api/cron/publish` with `CRON_SECRET`; without it, dates are `planned`, never auto-published. See `docs/SCHEDULING.md`.
