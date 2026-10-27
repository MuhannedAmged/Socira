# Security audit — Socira

**Date:** 2026-10-27  
**Scope:** the entire repository (117 project files: 17 route handlers, 22 pages, 15 components, 22 libraries, 6 models, proxy, configuration, docs, and 17 test files), plus dependency analysis.  
**Method:** static adversarial source review, threat-oriented data-flow tracing, and targeted regression tests. No live DAST or production data.

## Result

- **18 findings:** 2 High, 7 Medium, 9 Low.
- **17 fixed** in `afc8c9d` (12 have automated regression tests; 5 are code-reviewed only).
- **1 open** (F-18) and explicitly dependent on Supabase bucket configuration; not fixable in application code for signed direct uploads.
- **Dependencies:** `npm audit` and `npm audit --omit=dev` report **0** advisories.
- **Gates:** TypeScript, ESLint, 63 unit tests (17 files), and the production build all pass.

## Artifacts

| File | Contents |
|---|---|
| [FILE-INVENTORY.md](./FILE-INVENTORY.md) | Grouped inventory, notable files, ignored local files, repository/history checks |
| [COVERAGE.md](./COVERAGE.md) | Per-file coverage status for all 117 project files, with remediation markers |
| [FINDINGS.md](./FINDINGS.md) | All findings with baseline evidence, root cause, fix, and verification status |
| [REMEDIATION-LOG.md](./REMEDIATION-LOG.md) | Commit/change map, documentation changes, gates, rollback, unverified areas |
| [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md) | Accepted/deployment-dependent risks and a confidence statement |

## Read this before quoting the result

This is a **static, evidence-based audit of the repository**, not a penetration test. It does not prove the absence of vulnerabilities. Live OAuth, email delivery, MongoDB/Supabase integration, and browser CSP/CSRF behaviour were not exercised. See the confidence statement and "Explicitly not verified" section in [REMEDIATION-LOG.md](./REMEDIATION-LOG.md).
