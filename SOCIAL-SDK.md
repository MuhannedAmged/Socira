# Task: Build an AI-Readable, Continuously Maintained Social SDK Documentation System

You are working on a JavaScript/Next.js project that uses, or may use, `@opencoredev/social-sdk`.

Your task is to create a reliable, source-verified, AI-readable documentation knowledge base inside the project's `docs/` directory.

This documentation system must serve as the project's internal reference for future AI coding agents. Whenever an agent needs to implement, modify, debug, or understand a Social SDK feature, it must find the relevant official documentation, read and understand it, verify the actual API, and create or update the appropriate Markdown reference file before implementing the feature.

Do not simply write a generic overview. Build a practical, searchable, continuously maintained reference system.

---

## 1. Official Sources — Read and Use These URLs

### A. Main documentation and getting started

- Overview: https://social-sdk.dev/docs
- Installation: https://social-sdk.dev/docs/getting-started/installation
- Mock quickstart: https://social-sdk.dev/docs/getting-started/quickstart
- Choose an integration: https://social-sdk.dev/docs/getting-started/choose-an-integration
- Core concepts: https://social-sdk.dev/docs/concepts
- API reference: https://social-sdk.dev/docs/reference
- FAQ: https://social-sdk.dev/docs/reference/faq

### B. Publishing, posts, and media

- Publishing: https://social-sdk.dev/docs/publishing
- Media handling: https://social-sdk.dev/docs/media
- Read posts and analytics: https://social-sdk.dev/docs/reads
- Pagination: https://social-sdk.dev/docs/reads/pagination
- Analytics reports: https://social-sdk.dev/docs/reads/analytics
- Search: https://social-sdk.dev/docs/reads/search
- Social graph: https://social-sdk.dev/docs/reads/graph
- Comments and messaging: https://social-sdk.dev/docs/community
- Events and webhooks: https://social-sdk.dev/docs/events
- Scheduling: https://social-sdk.dev/docs/scheduling
- Publication outcomes and reconciliation: https://social-sdk.dev/docs/outcomes

### C. API contracts, capabilities, errors, and security

- Public API reference: https://social-sdk.dev/docs/reference
- Capabilities: https://social-sdk.dev/docs/capabilities
- Platform support matrix: https://social-sdk.dev/docs/platforms
- Errors: https://social-sdk.dev/docs/reference/errors
- Security: https://social-sdk.dev/docs/reference/security
- Authentication: https://social-sdk.dev/docs/authentication
- Authorization: https://social-sdk.dev/docs/authorization
- Operations, retries, and concurrency: https://social-sdk.dev/docs/operations
- Testing: https://social-sdk.dev/docs/testing
- CLI reference: https://social-sdk.dev/docs/cli

### D. Direct platform integrations

Inspect every relevant platform page, including:

- Instagram: https://social-sdk.dev/docs/platforms/instagram
- YouTube: https://social-sdk.dev/docs/platforms/youtube
- LinkedIn: https://social-sdk.dev/docs/platforms/linkedin
- Threads: https://social-sdk.dev/docs/platforms/threads
- TikTok: https://social-sdk.dev/docs/platforms/tiktok
- X: https://social-sdk.dev/docs/platforms/x
- Bluesky: https://social-sdk.dev/docs/platforms/bluesky

Also inspect the official platform support matrix and any additional platform pages linked from the documentation.

Do not assume that Facebook has a direct adapter. Verify whether a direct integration exists in the exact SDK version being used.

### E. Managed backend integrations

- Backend integrations overview: https://social-sdk.dev/docs/backends
- Zernio: https://social-sdk.dev/docs/backends/zernio
- Post for Me: https://social-sdk.dev/docs/backends/post-for-me
- PostFast: https://social-sdk.dev/docs/backends/postfast
- Postiz: https://social-sdk.dev/docs/backends/postiz
- Buffer: https://social-sdk.dev/docs/backends/buffer

Document the difference between direct platform adapters and managed backends. Do not add a managed backend to the project unless explicitly required.

### F. Frameworks, databases, and background jobs

- Integrations overview: https://social-sdk.dev/docs/integrations
- Next.js integration: https://social-sdk.dev/docs/integrations/nextjs
- Supabase integration: https://social-sdk.dev/docs/integrations/supabase
- Inngest integration: https://social-sdk.dev/docs/integrations/inngest

Inspect any additional database, framework, or job-runner integration guides that are relevant to the current project.

### G. Official source code

- GitHub repository: https://github.com/opencoredev/social-sdk
- Repository README: https://github.com/opencoredev/social-sdk/blob/main/README.md
- Repository agent instructions: https://github.com/opencoredev/social-sdk/blob/main/AGENTS.md
- Integration skill directory: https://github.com/opencoredev/social-sdk/tree/main/skills/integrate-social-sdk
- Examples directory: https://github.com/opencoredev/social-sdk/tree/main/examples
- Packages directory: https://github.com/opencoredev/social-sdk/tree/main/packages

The repository may contain additional documentation, examples, fixtures, tests, capability manifests, and implementation details. Inspect them whenever they are relevant.

IMPORTANT: Some URLs above may have moved, changed, or never existed under that exact path. Open the official documentation index, follow its actual navigation links, and find the correct current page when a URL fails. Never treat a guessed URL as verified. Record the canonical URL that actually works.

---

## 2. First Inspect the Existing Project

Before making any changes:

1. Inspect the existing `docs/` directory and its current files.
2. Inspect `package.json`, the lockfile, installed package version, and the application's current architecture.
3. Determine whether Social SDK is installed and which integrations are actually used.
4. Identify the JavaScript runtime and whether the project uses Next.js App Router or Pages Router.
5. Inspect existing project instructions, including `AGENTS.md`, `CLAUDE.md`, or similar files, if present.
6. Preserve existing documentation and application code.
7. Do not install dependencies or change the package version just to generate documentation.

If the SDK is not installed, use the official documentation and repository as references, but clearly mark version-specific information as unverified against an installed package.

Do not assume that the latest online documentation matches the version in the project.

---

## 3. Create the Documentation Structure

Create the following structure inside `docs/`, adapting existing files where appropriate:

docs/
social-sdk/
README.md
getting-started.md
core-concepts.md
api-reference.md
capabilities-matrix.md
publishing.md
media-handling.md
reads-and-analytics.md
comments-and-messaging.md
events-and-webhooks.md
scheduling-and-workers.md
authentication-and-authorization.md
security.md
errors-and-troubleshooting.md
testing-and-cli.md
direct-integrations.md
managed-backends.md
nextjs-integration.md
platform-guides/
instagram.md
youtube.md
linkedin.md
threads.md
tiktok.md
x.md
bluesky.md
backend-guides/
zernio.md
post-for-me.md
postfast.md
postiz.md
buffer.md
api/
README.md
decisions-and-limitations.md
source-index.md
maintenance.md

Create only the files that can be supported by real documentation and evidence. If a topic does not exist or is not applicable, explain that instead of inventing content.

The main entry point must be:

`docs/social-sdk/README.md`

This file should link to every available reference file and explain when an AI agent should read each one.

---

## 4. Mandatory Workflow Before Using Any Social SDK Feature

Whenever you need to implement, modify, debug, or explain a Social SDK feature, follow this exact process.

### Step 1: Identify the actual question

Determine the exact operation involved, such as:

- Connecting a social account.
- Publishing a post.
- Uploading a video.
- Publishing to multiple destinations.
- Scheduling a post.
- Reading posts or metrics.
- Reading or replying to comments.
- Sending messages.
- Updating or deleting a published post.
- Cancelling a scheduled post.
- Processing webhooks.
- Handling retries or uncertain publication outcomes.

### Step 2: Find the official documentation

Search `docs/social-sdk/` first.

If the existing reference is missing, incomplete, stale, or does not cover the operation, locate the corresponding official documentation page using the links above and the official site's navigation.

Read the relevant page in full enough to understand the operation, its prerequisites, examples, limitations, and related references.

Do not rely only on search-result snippets, page titles, old conversation messages, or your pretrained knowledge.

### Step 3: Verify the API

Before using any function, verify it against the strongest available evidence:

1. Documentation for the relevant operation.
2. Documentation for the relevant platform or backend.
3. The actual installed package's public exports and types.
4. The official repository's implementation, tests, fixtures, and capability manifests where needed.
5. The official upstream platform API documentation when the operation depends on platform restrictions.

Verify the exact function name, import path, input shape, output shape, required permissions, and supported platform/backend.

Do not infer that a method exists merely because a similar method exists elsewhere in the SDK.

### Step 4: Create or update a Markdown reference

Before implementing the feature, create or update the most relevant file inside `docs/social-sdk/`.

For example:

- Video publishing → `media-handling.md` and the relevant platform guide.
- Instagram publishing → `platform-guides/instagram.md` and `publishing.md`.
- Deleting a post → `decisions-and-limitations.md` and the relevant platform guide.
- Scheduled publishing → `scheduling-and-workers.md`.
- An unfamiliar function → a dedicated API reference under `api/` if needed.
- A bug caused by a platform-specific restriction → the relevant platform guide and `errors-and-troubleshooting.md`.

Do not create duplicate files for information already documented. Update existing files and link related references instead.

### Step 5: Implement using the verified reference

Only after the relevant documentation has been verified should you implement the feature.

Follow the existing project's architecture, coding conventions, authentication model, and error-handling patterns.

### Step 6: Verify the implementation

Run the appropriate available checks and tests.

If the behavior has only been tested with a mock or fixture, do not claim it works against a real social account.

If live verification requires credentials, permissions, or account approval that are unavailable, explicitly state what remains unverified.

### Step 7: Record new discoveries

If implementation reveals a new limitation, undocumented behavior, corrected API signature, or useful working example, update the relevant Markdown file immediately.

Keep the documentation consistent with the actual code.

---

## 5. Requirements for Every Markdown Reference

Every reference file must contain the following sections where applicable:

1. **Purpose** — What this feature or API is used for.
2. **When to read this file** — Specific tasks that require this reference.
3. **Official sources** — Canonical documentation URLs.
4. **Version information** — SDK version and date last verified.
5. **Prerequisites** — Runtime, credentials, account type, OAuth scopes, permissions, or approvals.
6. **Verified API contract** — Exact function names, import paths, inputs, outputs, and return types.
7. **JavaScript examples** — Minimal working examples consistent with the project's JavaScript preference.
8. **Platform/backend support** — Precisely which integrations support the operation.
9. **Limitations** — Unsupported behavior, quotas, media restrictions, and platform-specific requirements.
10. **Error handling** — Relevant error codes and safe recovery procedures.
11. **Security considerations** — Token protection, authorization, ownership, and data handling.
12. **Testing instructions** — What can be tested locally and what requires live credentials.
13. **Related references** — Links to other internal documentation files.
14. **Evidence status** — Distinguish documentation-verified, source-verified, mock-tested, and live-tested behavior.

Use a concise format, useful headings, searchable terms, and real code examples. Avoid unnecessary repetition.

---

## 6. Build a Complete API Reference

Inspect the public exports of the exact package version and create a useful API index.

For each relevant public function, method, type, or CLI command, document:

- Exact exported name.
- Exact import path.
- Purpose.
- Parameters and their types.
- Required and optional fields.
- Return value and type.
- Possible errors.
- Supported adapters or capabilities.
- Minimal JavaScript example.
- Official source link.
- Whether the behavior is documented, source-verified, or tested.

Include the actual methods available in the installed version. Do not fabricate a list of all possible functions from memory.

If the complete API surface is large, split it into multiple Markdown files under `docs/social-sdk/api/` and link them from `api-reference.md`.

---

## 7. Maintain a Platform Capability Matrix

Create a capability matrix showing which operations are available for each platform and backend.

Include relevant operations such as:

- Account connection and account reads.
- Text, image, video, carousel, and document publishing.
- Post reads and analytics.
- Likes and comments.
- Comment replies.
- Messaging.
- Editing published posts.
- Deleting published posts.
- Cancelling scheduled posts.
- Backend-record deletion.
- Native platform operations.
- Media upload methods.
- Scheduling support.

For every operation, use clear statuses:

- Supported.
- Partially supported.
- Unsupported by the platform.
- Not implemented by this adapter.
- Unknown or unverified.

These statuses are not interchangeable.

Include required permissions, content formats, important constraints, and evidence links where available.

Do not claim support merely because the upstream platform's API offers a feature. Verify that the relevant Social SDK adapter implements it.

---

## 8. Special Rules for Media and Publishing

Document the complete lifecycle of media and publication operations.

Explain, where supported:

- Local file handling.
- Blob, stream, and URL inputs.
- Public HTTPS URLs.
- Signed URL expiration.
- Upload sessions.
- Platform-specific media constraints.
- Video processing and polling.
- Publication outcomes.
- Partial success across multiple destinations.
- Retry behavior.
- Idempotency.
- Reconciliation after an ambiguous result.
- Safe cleanup of temporary files.

Never assume that a file can be deleted immediately after a publishing request is submitted.

Never assume all platforms support the same media formats or accept the same upload inputs.

Document the exact evidence needed before treating a post as published and before deleting its temporary media.

---

## 9. Special Rules for Authentication and Security

The internal reference must explicitly state:

- Social SDK is server-side and must not be imported into browser code.
- OAuth tokens, refresh tokens, provider API keys, and webhook secrets must remain server-side.
- Every operation must authorize the selected account for the current application user or tenant.
- A connected-account reference must not be trusted merely because it came from the client.
- Secrets must not appear in logs, public documentation examples, fixtures, or client bundles.
- Memory-only credential stores are not production persistence.
- Native access paths may bypass some normalized SDK protections and require special care.
- Webhook signatures and raw request bodies must be handled according to the relevant verification requirements.

Use environment variable placeholders in examples. Never include real secrets.

---

## 10. Keep the Knowledge Base Updated

Create `docs/social-sdk/maintenance.md` documenting the maintenance procedure.

Whenever an SDK-related task is performed:

1. Check whether the relevant documentation already exists.
2. Compare it against the current official source and installed version.
3. Update the relevant Markdown reference if necessary.
4. Add newly verified limitations and examples.
5. Update the source index if canonical URLs change.
6. Record the verification date and evidence level.
7. Avoid rewriting unrelated files or producing duplicate documentation.

Do not re-read every page on every task. Read the pages relevant to the current operation, then follow related links where needed.

If an existing reference is still accurate and adequately supported, reuse it instead of creating another file.

Do not update the package version automatically.

---

## 11. AI Agent Instructions

Create or update the project's root `AGENTS.md` with a short section titled:

`## Social SDK Documentation Protocol`

The section must instruct future AI agents to:

1. Read `docs/social-sdk/README.md` before starting Social SDK work.
2. Identify the exact operation and relevant platform/backend.
3. Read the matching internal Markdown references.
4. Consult official documentation whenever the reference is missing, stale, or incomplete.
5. Verify function signatures and capabilities against the installed package.
6. Update the relevant Markdown file before implementing unfamiliar functionality.
7. Test the implementation and report its evidence level honestly.
8. Never invent API methods or claim unsupported capabilities.
9. Preserve the project's existing architecture and avoid unnecessary changes.

Do not overwrite existing instructions in `AGENTS.md`. Merge the new section into the current file.

---

## 12. Final Validation and Report

After creating the documentation:

- Check all generated internal Markdown links.
- Check for duplicate or contradictory claims.
- Check that every API example uses verified method names and imports.
- Check that every unsupported or uncertain feature is clearly labeled.
- Check that official URLs are canonical and accessible when network access is available.
- Check that `docs/social-sdk/README.md` links to all generated reference files.
- Confirm that existing application code and dependencies were not unnecessarily modified.

At the end, report:

1. Files created.
2. Existing files updated.
3. Official sources inspected.
4. SDK version verified.
5. Main capabilities documented.
6. Unsupported or unverified operations.
7. Tests or validation performed.
8. Any URLs or documentation sections that could not be accessed.

Do not claim to have read every source if only a subset was accessible.

## Final Principle

The goal is not merely to document Social SDK once. The goal is to create a maintainable, source-backed knowledge base that helps future AI coding agents discover, understand, verify, implement, and test Social SDK functionality correctly without relying on memory or hallucinated APIs.
