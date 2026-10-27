# Security audit — Socira

**Date:** 2026-10-27  
**Scope:** the entire repository (126 project files, including 22 test files), plus dependency analysis.  
**Method:** static adversarial source review, threat-oriented data-flow tracing, and targeted regression tests. No live DAST or production data.

## Result

- **18 findings:** 2 High, 7 Medium, 9 Low.
- **18 fixed** (15 have automated regression tests; 3 are code-reviewed only). The first 17 landed in `afc8c9d`; F-18 and four residual-risk items were completed in `f962179`.
- **Residual risks** remain in [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md); none of them is presented as fixed.
- **Dependencies:** `npm audit` and `npm audit --omit=dev` report **0** advisories.
- **Gates:** TypeScript, ESLint, 93 unit tests (22 files), and the production build all pass. A production-mode smoke test confirmed per-request nonces, matching `nonce` attributes, public-page access, and the `/dashboard` login redirect.

## Artifacts

| File | Contents |
|---|---|
| [FILE-INVENTORY.md](./FILE-INVENTORY.md) | Grouped inventory, notable files, ignored local files, repository/history checks |
| [COVERAGE.md](./COVERAGE.md) | Per-file coverage status for all 126 project files, with remediation markers |
| [FINDINGS.md](./FINDINGS.md) | All findings with baseline evidence, root cause, fix, and verification status |
| [REMEDIATION-LOG.md](./REMEDIATION-LOG.md) | Commit/change map, documentation changes, gates, rollback, unverified areas |
| [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md) | Accepted/deployment-dependent risks and a confidence statement |

## Read this before quoting the result

This is a **static, evidence-based audit of the repository**, not a penetration test. It does not prove the absence of vulnerabilities. Live OAuth, email delivery, MongoDB/Supabase integration, browser CSP reports, and CSRF behaviour were not exercised. See the confidence statement and "Explicitly not verified" section in [REMEDIATION-LOG.md](./REMEDIATION-LOG.md).
