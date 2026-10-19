# Social SDK implementation

- Package: `@opencoredev/social-sdk@0.5.0` (server-only; never import in browser code).
- Reference entry: `SOCIAL-SDK.md` + official docs at https://social-sdk.dev/docs.
- Runtime: Node.js Route Handlers only. No Edge runtime for SDK integrations.

## OAuth lifecycle (implemented)

1. `GET /api/social/connect?platform=` validates the session, rate-limits, and resolves platform config (`src/lib/social/oauth.ts`). Missing credentials return `503` naming every absent variable; Facebook returns `400` with the reason it cannot connect.
2. `ConnectionManager.begin` (SDK) generates 256-bit `state` + PKCE verifier, builds the provider authorization URL, and persists the attempt through `MongoConnectionStore` (`src/lib/social/connection-store.ts`). The browser is sent to `authorizationUrl`.
3. The platform redirects to `GET /api/social/callback?code=…&state=…`. The route resolves the attempt by `state` + session owner, then `ConnectionManager.discover` re-checks ownership, expiry, the exact redirect origin/path, and `state` in constant time.
4. The SDK exchanges the code server-side. `credentialSink` upserts `SocialAccount` and writes an AES-256-GCM `Credential` (key version, scopes, expiry, token revision). The SDK discovers accounts from the provider itself.
5. `ConnectionManager.select` consumes the attempt atomically and issues grants; the browser lands on `/accounts?connected=<n>` or `/accounts?error=<code>`.

Attempts are single-use: `claimDiscovery` prevents a second code exchange, and `complete` refuses a consumed attempt. Attempt documents carry a TTL index, so expired attempts are removed by MongoDB. The PKCE verifier never leaves the server.

Provider coverage and requirements:

| Platform | Provider kind | Environment |
| --- | --- | --- |
| YouTube | `youtube` | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` |
| Instagram | `instagram` | `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` |
| LinkedIn | `linkedin` | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_API_VERSION` (`YYYYMM`) |
| TikTok | `tiktok` | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` |
| X | `x` | `X_CLIENT_ID`, `X_CLIENT_SECRET` |
| Facebook | none | Not supported by the installed SDK — reported as unsupported |

`MemoryConnectionStore` is not used for production. Attempts and credentials live in MongoDB.

## Publishing

`social.posts.prepare` (where documented) → `social.posts.publish` with `connectedAccountRef` resolved from trusted DB records, tenant/principal context, and an idempotency key per logical publication. Outcomes persist per destination (`published | failed | unknown | accepted/processing`); ambiguous results reconcile via delivery references before retry.

## Evidence status

Source-verified against the installed package (`dist/server/connections.js`, `dist/server/oauth.js`, type declarations). Authorization-URL construction is unit tested without network calls (`src/lib/social/oauth.test.ts`). **Not live-tested** — no real OAuth client credentials exist in this environment, no posts were sent, and no platform approvals were completed.
