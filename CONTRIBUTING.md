# Contributing to Socira

Thanks for helping build honest, open-source social tooling.

## Ground rules

1. TypeScript strict. No `any`, `@ts-ignore`, or `@ts-nocheck`.
2. Server owns secrets: OAuth, tokens, encryption keys, and SDK calls stay in Route Handlers / server modules. Never add secrets to `NEXT_PUBLIC_` vars.
3. Every DB query is ownership-scoped (`ownerId` = session user). Add a regression test for cross-user access on new resources.
4. Never fake success: no simulated OAuth, publishing, or analytics. Disable unsupported actions with an explanation instead.
5. Tailwind v4 CSS-first (`@import "tailwindcss"`, `@theme`), Tabler icons (`@tabler/icons-react`), Hanken Grotesk, semantic theme tokens — no hardcoded palette hexes in components.

## Workflow

```bash
npm install
cp .env.example .env.local
npm run dev
npm test
npm run build
```

## Pull requests

- Small, focused diffs with `npm run build` + `npm test` passing.
- Update `docs/PLATFORM-CAPABILITIES.md` when touching publish/analytics paths.
- Never commit `.env.local` or real secrets.
