# Social SDK implementation

- Package: `@opencoredev/social-sdk` (server-only; never import in browser code).
- Reference entry: `SOCIAL-SDK.md` + official docs at https://social-sdk.dev/docs.
- Runtime: Node.js Route Handlers only. No Edge runtime for SDK integrations.

## OAuth lifecycle

1. `GET /api/social/connect?platform=` validates session + platform, checks env, creates `OAuthAttempt` (10-min expiry, `stateHash`, `pending`).
2. Browser redirects to the official platform authorization page (provider factory per installed SDK version and platform guide).
3. `GET /api/social/callback?attemptId=` validates ownership, expiry, single-use `pending` → `consumed` (replay protected) before any code exchange.
4. Server exchanges the code, discovers accounts via the SDK provider flow, presents selection, and persists `SocialAccount` + encrypted `Credential` (AES-256-GCM, key version, token revision).

`MemoryConnectionStore` is not used for production. Attempts and credentials live in MongoDB.

## Publishing

`social.posts.prepare` (where documented) → `social.posts.publish` with `connectedAccountRef` resolved from trusted DB records, tenant/principal context, and an idempotency key per logical publication. Outcomes persist per destination (`published | failed | unknown | accepted/processing`); ambiguous results reconcile via delivery references before retry.

## Evidence status

Documentation-verified against the SDK docs index; source-verified where the installed package exports allow. Mock-tested locally. **Not live-tested** — no real posts were sent and no platform approvals were completed in this environment.
