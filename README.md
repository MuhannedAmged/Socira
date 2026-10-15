# Socira — open-source social media management

Connect **Instagram, Facebook, YouTube, LinkedIn, TikTok, and X** in one honest workspace: real OAuth, encrypted credentials, per-destination publish receipts, and scheduling that never fakes automation.

- MIT licensed. No subscriptions, paywalls, or premium tiers.
- Stack: Next.js 16 App Router · TypeScript strict · Tailwind v4 · `@tabler/icons-react` · Hanken Grotesk · Mongoose/MongoDB · Supabase Storage · Resend · Social SDK (`@opencoredev/social-sdk`).

## Quickstart

```bash
npm install
cp .env.example .env.local   # fill in values below
npm run dev
```

Required for full functionality: `MONGODB_URI`, `AUTH_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`.
Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. Media: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`.
Each social platform needs its own OAuth credentials (see `.env.example`) plus a registered callback URL like `https://your-app/api/social/callback`.

Without credentials the app still runs: connections and publishing report exactly what is missing instead of failing silently.

## Docs

- `docs/ARCHITECTURE.md` — modules, data flow, tenant isolation
- `docs/PLATFORM-CAPABILITIES.md` — verified per-platform support matrix
- `docs/SOCIAL-SDK-IMPLEMENTATION.md` — SDK version, providers, OAuth lifecycle
- `docs/SECURITY.md` — threat model, encryption, OAuth, storage
- `docs/DEPLOYMENT.md` — production checklist
- `docs/SCHEDULING.md` — native vs hosting-cron vs planned
- `SOCIAL-SDK.md` — documentation protocol for AI agents

## Scripts

- `npm run dev` / `npm run build` / `npm start` / `npm run lint`
- `npm test` — unit tests (capability registry, crypto round-trip, validation)

## License

MIT — see `LICENSE`.
