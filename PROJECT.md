# Master Prompt: Build a Complete Open-Source Social Media Management Platform

Act as a senior full-stack engineer, software architect, UI/UX designer, security engineer, and QA engineer. Your task is to inspect the existing repository and build a complete, production-oriented, open-source social media management platform using Next.js, TypeScript, MongoDB, Supabase Storage, Resend, and Social SDK.

Do not stop after creating a landing page, dashboard mockup, or basic CRUD application. Implement the complete application, including authentication, social account connections, publishing workflows, media management, analytics where supported, notifications, settings, testing, and documentation.

The application must be usable by multiple independent users. Each user must be able to register, verify their email, sign in, connect their own social media accounts, and manage their content without accessing another user's private data.

---

# 1. Mandatory Repository Inspection

Before writing or modifying code:

1. Inspect the complete repository structure.
2. Read `package.json`, the existing application configuration, environment examples, database models, routes, components, styling system, and available documentation.
3. **Read the entire `SOCIAL-SDK.md` file located in the project root before implementing any social media integration.**
4. Read the current official Social SDK documentation at:
   - https://social-sdk.dev/docs
   - https://social-sdk.dev/docs/integrations/nextjs
   - https://social-sdk.dev/docs/authentication
   - https://social-sdk.dev/docs/publishing
   - https://social-sdk.dev/docs/reference
   - https://social-sdk.dev/docs/reference/faq
5. Verify the current API contracts, provider exports, OAuth workflows, adapter configuration, capability declarations, token management, and supported operations.
6. Inspect existing features before changing them. Preserve working functionality and avoid unnecessary rewrites.
7. Identify missing configuration and external credentials without inventing values.

If `SOCIAL-SDK.md` is missing, stop the social integration implementation phase. Report the missing file and continue with independent parts of the application. Do not guess undocumented APIs or pretend the integration is complete. You may inspect official documentation, but resume implementation only after the required project-specific document is available.

Create an implementation checklist and a short architecture plan before proceeding. Continue implementing after documenting the plan; do not stop at the planning stage.

# 2. Non-Negotiable Project Constraints

These requirements are mandatory.

- Use **TypeScript with strict mode**. Do not use JavaScript for application source files.
- Use one Next.js application with the App Router. Do not create a separate Express, NestJS, or standalone backend project.
- Use React and Next.js Server Components by default. Add Client Components only when interactivity requires them.
- Use Tailwind CSS and shadcn/ui.
- Use Lucide icons.
- Use MongoDB with Mongoose for persistent application data.
- Use Supabase Storage for user-uploaded media.
- Use Resend for verification emails and other necessary transactional emails.
- Use Social SDK for social platform integrations.
- Use Zod for validation and React Hook Form for complex forms.
- Use an established authentication solution compatible with Next.js and MongoDB, or implement authentication securely if no suitable existing solution is available.
- Do not use a paid third-party task scheduler, managed social publishing backend, or external background-job service.
- Do not introduce Inngest, Trigger.dev, QStash, or similar services.
- Do not add Stripe, payment processing, billing pages, subscription plans, paywalls, or premium feature tiers.
- The application must be open source and must not impose application-level subscription restrictions.
- Do not require a paid managed Social SDK backend. Use direct platform integrations wherever the SDK supports the required operation.
- Never place private credentials, access tokens, refresh tokens, or privileged Supabase keys in browser-accessible code.
- Never implement fake publishing, fake OAuth connections, simulated successful API responses, or fabricated analytics as if they were real.
- Never claim that an unsupported capability works.
- Do not use `any`, `@ts-ignore`, or `@ts-nocheck` to bypass type errors.
- Do not leave core features as TODOs, placeholder buttons, or disconnected mock interfaces.

Choose compatible package versions and use the official documentation for their current APIs.

# 3. Product Vision

Build a polished, responsive, multi-user social media management platform that allows users to connect and manage these six platforms only:

1. Instagram
2. Facebook
3. YouTube
4. LinkedIn
5. TikTok
6. X

Do not add other social platforms to the product's supported account connection flow.

The platform should provide a unified workspace for:

- Connecting and managing social accounts.
- Creating posts.
- Uploading and organizing media.
- Saving drafts.
- Publishing immediately.
- Scheduling posts only when a verified, reliable execution mechanism is available.
- Viewing publication status and delivery results.
- Managing a content calendar.
- Viewing real analytics where supported.
- Managing supported comments and community interactions.
- Receiving in-app notifications.
- Managing profile, security, and account settings.

The interface should make unsupported capabilities and missing configuration clear without making the product feel incomplete or unreliable.

# 4. Architecture

Use a modular monolithic architecture within a single Next.js repository.

Suggested structure:

```text
src/
  app/
    (marketing)/
    (auth)/
    (dashboard)/
      dashboard/
      accounts/
      compose/
      calendar/
      posts/
      media/
      analytics/
      inbox/
      notifications/
      settings/
    api/
      auth/
      social/
      posts/
      media/
      analytics/
      comments/
      notifications/
      cron/
      webhooks/
  components/
    ui/
    layout/
    dashboard/
    accounts/
    composer/
    calendar/
    media/
    analytics/
    inbox/
    notifications/
  lib/
    auth/
    db/
    email/
    social/
      client.ts
      providers/
      oauth/
      publishing/
      capabilities/
      credentials/
      authorization/
    storage/
    security/
    validation/
    notifications/
    scheduling/
    rate-limit/
    utils/
  models/
  services/
  hooks/
  types/
  config/
  constants/
  tests/
docs/
public/
```

Adapt this structure to the existing repository where appropriate. Do not create duplicate abstractions or unnecessarily fragment simple features.

Keep social integration, authentication, database operations, and other sensitive business logic on the server.

Use Route Handlers and Server Actions appropriately. Every sensitive operation must have server-side authentication, authorization, validation, and error handling.

Use the Node.js runtime for Social SDK integrations. Respect the SDK's supported runtime requirements, ESM compatibility, and documented limitations. Do not run its server-only integrations in Edge Runtime.

# 5. Design System and User Experience

Create a professional social media management interface with a distinctive visual identity.

The interface should feel like a polished modern SaaS dashboard, not a generic admin template.

## Design principles

- Clear visual hierarchy.
- Consistent spacing and typography.
- Restrained use of borders, shadows, and rounded corners.
- A cohesive color system using CSS variables.
- Excellent readability.
- Responsive layouts for desktop, tablet, and mobile.
- Subtle, purposeful transitions.
- Accessible interactions and keyboard navigation.
- Clear loading, empty, success, warning, and error states.
- No excessive animations or unnecessary visual decoration.
- No random colors or inconsistent component styling.

Use Tailwind CSS and shadcn/ui components consistently. Customize their appearance to create a cohesive product rather than leaving every component in its default style.

Use Lucide icons instead of emojis for interface controls.

Implement both light and dark modes, with a persistent user preference. Use semantic theme tokens instead of hardcoded colors scattered throughout components.

## Marketing pages

Create a complete public-facing landing page with:

- A responsive navigation bar.
- Product introduction and clear call to action.
- Supported platform overview.
- Feature sections.
- A clear explanation of how account connections work.
- Security and privacy highlights.
- Product screenshots or carefully designed interface previews.
- An FAQ.
- Footer with legal and project links.

Do not invent testimonials, customer counts, performance statistics, or company claims.

## Authentication pages

Create polished pages for:

- Registration.
- Email verification.
- Login.
- Forgot password.
- Reset password.
- Verification resend.
- Expired-link and invalid-code handling.

## Authenticated dashboard

Create a responsive application shell containing:

- Collapsible sidebar.
- Top navigation.
- Current workspace or user context.
- Quick-create action.
- Notifications access.
- Theme selector.
- Profile menu.
- Responsive mobile navigation.

Dashboard overview should show genuine information from the current user's data:

- Connected accounts.
- Recent posts.
- Draft count.
- Upcoming scheduled posts.
- Published post count.
- Recent publication failures.
- Available analytics summaries.
- Recent notifications.

Display empty states for new users. Do not fill a new user's dashboard with fabricated activity or analytics.

# 6. Authentication and Email Verification

Implement a complete authentication system.

## Registration

Require appropriate fields, such as:

- Name.
- Email address.
- Password.
- Password confirmation where useful.
- Acceptance of the privacy policy and terms.

Validate inputs with Zod on the server. Provide useful, accessible form errors.

Prevent duplicate accounts and normalize email addresses consistently.

Hash passwords using a suitable, well-maintained password-hashing algorithm if credentials are managed directly by the application. Never store plaintext passwords.

## Email verification using Resend

Use Resend to send a one-time email verification code.

Required behavior:

1. Generate a cryptographically secure, short numeric verification code.
2. Store only a secure hash of the code, not its plaintext value.
3. Associate it with the correct user and purpose.
4. Give it a short, configurable expiration time.
5. Invalidate previous codes when a new one is issued.
6. Limit resend frequency and verification attempts.
7. Use constant-time comparison where applicable.
8. Invalidate the code after successful use.
9. Mark the account verified only after successful server-side verification.
10. Never log verification codes or expose them in API responses.
11. Prevent email enumeration where practical.
12. Return clear feedback for expired, invalid, and already-used codes.

Use environment variables for the Resend API key and verified sender address.

Do not send real emails in automated tests by default.

## Login and sessions

Implement:

- Secure session management.
- Appropriate cookie settings, including `HttpOnly`, `Secure` in production, and a suitable `SameSite` policy.
- Session expiration.
- Logout.
- Session invalidation when necessary.
- Protection against brute-force attempts.
- Rate limiting for sensitive authentication endpoints.
- Authorization checks for every protected route.

Use a maintained authentication library if it fits the existing application and supports the required MongoDB integration. Do not invent authentication APIs.

## Password recovery

Implement secure password reset tokens with:

- Cryptographically secure generation.
- Hashed storage.
- Expiration.
- Single-use validation.
- Rate limits.
- Email delivery through Resend.
- Session invalidation or other appropriate security measures after a password reset.

Unverified accounts must not be allowed to perform operations that require verified ownership.

# 7. Multi-User Data Isolation

This is a critical requirement.

Every user's social accounts, posts, drafts, media assets, analytics records, notifications, and settings must be isolated.

Use a consistent tenant authorization model, even if each registered user initially owns one personal workspace.

Every protected database query must be scoped to the authenticated user or authorized workspace.

Do not trust a user ID, workspace ID, social account ID, publication ID, or storage path supplied by the browser.

Resolve resource ownership on the server before performing operations.

For every social operation:

1. Authenticate the current application user.
2. Resolve the account from the database.
3. Verify that the account belongs to the current user or authorized workspace.
4. Resolve the saved SDK account reference from trusted server-side data.
5. Check the requested operation against the account's supported capabilities and granted scopes.
6. Perform the operation on the server.
7. Persist the actual outcome.

Do not use a browser-provided account reference as proof of ownership.

Prevent cross-user IDOR vulnerabilities. Add automated tests proving that one user cannot read, modify, publish to, disconnect, or delete another user's resources.

# 8. Social SDK Integration

This is one of the most important parts of the application.

Read `SOCIAL-SDK.md` in full before implementing this section.

Use the official Social SDK package:

`@opencoredev/social-sdk`

Follow its current official documentation and exact TypeScript exports.

Do not assume the SDK provides hosted account management, credential storage, a database, a job queue, a scheduler, or a background worker. The application must implement the required infrastructure.

## Supported platforms

Only implement the following six platform integrations:

- Instagram.
- Facebook.
- YouTube.
- LinkedIn.
- TikTok.
- X.

Investigate the exact current SDK adapter and OAuth provider for each platform before implementation.

Use direct platform integrations where supported. Do not silently route a user's account through an unrelated managed social publishing provider.

## Developer application credentials

Create an environment configuration for the credentials required by each platform.

Use documented variable names and provider requirements. Likely categories include:

- Instagram app credentials.
- Meta app credentials and any required Facebook configuration.
- Google OAuth credentials.
- LinkedIn OAuth credentials.
- TikTok application credentials.
- X application credentials.

Do not assume that one platform's credentials can be reused for another.

Keep all client secrets and provider credentials server-side.

Provide a complete `.env.example` with descriptive placeholders, never real secrets.

Document where each credential is obtained, which callback URL must be registered, which scopes are required, and which platform reviews or approvals may be necessary.

## OAuth connection lifecycle

Implement a complete, secure account connection flow for every supported platform.

The flow should include:

1. Authenticated user initiates connection.
2. Server validates the requested platform and the user's permissions.
3. Server creates an OAuth attempt using the documented Social SDK flow.
4. Server generates or validates secure state through the SDK's documented mechanism.
5. Browser redirects to the official platform authorization page.
6. User signs in to the platform and approves the requested permissions.
7. Platform redirects to the registered callback URL.
8. Server validates the callback, state, attempt ownership, redirect URI, and expiration.
9. Server exchanges the authorization code using the official provider flow.
10. SDK discovers the available authorized accounts.
11. Application presents account selection if multiple accounts are discovered.
12. Server accepts only accounts discovered by the trusted OAuth attempt.
13. Server stores the selected account credentials securely.
14. Application creates or updates its account records and tenant grants.
15. User sees a confirmed connected status.

Use `ConnectionManager` and the corresponding documented OAuth provider factories when applicable.

Follow the SDK's actual `begin`, `discover`, `select`, or `complete` lifecycle as appropriate to the current API.

Use a durable production `ConnectionStore` and credential sink backed by MongoDB or an appropriate adapter implementation. Do not use `MemoryConnectionStore`, in-memory maps, or other in-memory stores as production persistence.

Implement persistent OAuth attempts with:

- Expiration.
- Ownership verification.
- State validation.
- One-time callback consumption.
- Safe retry handling.
- Protection against authorization-code replay.
- Idempotent credential persistence.

Do not trust callback-supplied account IDs or tokens. Only accept account identities discovered and validated by the server-side provider flow.

## Account management

Create a complete Connected Accounts page.

Each account card should display available, verified information such as:

- Platform icon and name.
- Account name or handle.
- Profile image, when available.
- Account type where available.
- Granted scopes or a summarized permissions status.
- Connection status.
- Last successful synchronization.
- Reconnection-required state.
- Supported capabilities.

Implement:

- Connect account.
- Select discovered accounts.
- View account details.
- Reconnect account.
- Disconnect account.
- Remove the local connection.
- Refresh account information where supported.
- Handle revoked permissions and expired tokens.
- Display actionable errors.

Distinguish between disconnecting a local connection and revoking a provider grant. Implement remote revocation only where the platform officially supports it and the relevant user action requires it.

Never display an account as connected before credentials and grants have been successfully persisted.

# 9. Capability Discovery and Honest Feature Support

Create a platform capability registry driven by the actual SDK adapters and documented capability manifests.

Create `docs/PLATFORM-CAPABILITIES.md`.

For each of the six platforms, document support for:

- OAuth connection.
- Account discovery.
- Text publishing.
- Image publishing.
- Video publishing.
- Carousel or multiple-media publishing.
- Native scheduling.
- External scheduled publishing through the application's own execution mechanism.
- Drafts.
- Analytics.
- Comments and replies.
- Media retrieval.
- Post deletion.
- Webhooks.
- Token refresh.
- Any additional operation the application exposes.

Use explicit capability states such as:

- Supported.
- Partially supported.
- Unsupported.
- Requires approval.
- Requires additional scopes.
- Requires additional configuration.
- Not verified.

Verify each operation against the actual installed SDK version and current official documentation.

A feature available in a platform's upstream API must not automatically be considered implemented in Social SDK.

A capability that has not been live-tested must not be described as live-verified.

Use capability-aware UI behavior. Disable unavailable operations with a clear explanation rather than letting them fail unpredictably.

# 10. Publishing and Composer

Build a complete content composer.

## Composer features

Include:

- Post text editor.
- Character count based on each destination's verified limits.
- Connected account selector.
- Multi-platform publishing where the content is compatible with every selected destination.
- Image upload.
- Video upload.
- Media preview.
- Reordering media when supported.
- Alt text where supported.
- Platform-specific content options.
- Save draft.
- Preview.
- Publish now.
- Schedule controls only when the relevant scheduling mechanism is genuinely available.
- Validation errors before publication.
- Per-platform publishing results.

Create a clear, accessible workflow that helps users understand when a post is ready to publish.

## Platform-specific validation

Do not assume that identical content can be published everywhere.

Validate:

- Character limits.
- Media count.
- Image formats and sizes.
- Video formats and duration.
- Aspect ratios where relevant.
- Required metadata.
- Platform-specific publication settings.
- Account permissions.
- Content format compatibility.

Validate these restrictions against current documentation and the actual adapter capabilities.

If selected destinations require different media or text, offer a platform-specific customization interface rather than silently modifying content.

## Publish now

Implement real publishing through Social SDK.

Use the SDK's documented methods, such as `social.posts.prepare` where appropriate and `social.posts.publish` for publication.

Use `connectedAccountRef` and other SDK types exactly as documented.

Resolve account references exclusively from trusted, authorized server-side database records.

Use an idempotency key derived from a stable logical publication identity to reduce duplicate publication caused by double submissions or safe retries.

Pass the SDK's documented authorization context, including tenant and principal identity where required.

Record the real outcome for every selected destination.

Support these states or their documented equivalents:

- Draft.
- Queued, only if an actual queue exists.
- Publishing.
- Published.
- Scheduled.
- Accepted or processing.
- Failed.
- Unknown outcome.
- Cancelled where cancellation is genuinely supported.

Do not treat an accepted request as proof of successful publication.

A multi-platform publication may partially succeed. Display each destination's actual result independently.

If the SDK reports an ambiguous or unknown outcome, reconcile it through documented delivery references or provider reads before retrying. Never blindly repeat a publication that might already have succeeded.

## Content library

Implement a searchable content library containing:

- Drafts.
- Published posts.
- Failed publications.
- Scheduled posts where real scheduling is available.
- Media attachments.
- Destination information.
- Publication timestamps.
- Platform post identifiers and URLs where available.

Include filters, pagination, sorting, and useful empty states.

# 11. Media Uploads and Supabase Storage

Use Supabase Storage for uploaded images and videos.

Use a private bucket by default.

Implement:

- Authenticated upload initiation.
- Server-side authorization.
- Signed upload or download URLs where appropriate.
- User-scoped object paths.
- File size limits.
- File type validation.
- Safe filename handling.
- Media metadata storage.
- Upload progress.
- Upload failure recovery.
- Media previews.
- Delete operations with ownership checks.
- Cleanup of abandoned uploads where practical.

Do not rely only on file extensions or browser-provided MIME types. Validate file signatures when feasible.

Prevent path traversal and unauthorized cross-user media access.

Keep the Supabase service-role key exclusively on the server. Never expose it through a `NEXT_PUBLIC_` environment variable.

Use stable URLs or valid signed URLs compatible with the actual Social SDK upload workflow. If a social platform needs to fetch media publicly, do not assume a private storage URL will work. Use a supported upload mechanism or a carefully controlled temporary URL if the platform and SDK allow it.

Do not delete media required by a pending publication.

Implement a media library with grid/list views, search, filters, upload status, metadata, and deletion confirmation.

Support images and videos only to the extent that each destination and adapter supports them.

# 12. Scheduling Without External Job Services

This constraint is mandatory.

Do not use:

- Inngest.
- Trigger.dev.
- QStash.
- External background-job platforms.
- A separate task scheduling service.
- Browser timers as a production scheduler.
- In-memory queues as persistent scheduling.
- Long-running processes that are assumed to remain alive on serverless hosting.

The Social SDK is a library, not a scheduler. Build a scheduling implementation only when a reliable execution mechanism exists.

## Native scheduling

Use native scheduling only when the selected direct adapter and platform actually support storing a post and publishing it later.

According to the current Social SDK documentation, native scheduling is supported by the direct YouTube adapter; the other direct adapters among our six selected platforms do not currently provide native publish-time scheduling.

Recheck the installed version and its official capability manifests before implementing this behavior.

Do not pass a `schedule` option to adapters that reject it.

## Hosting-provided scheduled invocation

For platforms without native scheduling, implement a protected scheduled-publication endpoint that a deployment's own built-in cron facility can invoke, but only when that facility is available and configured reliably.

For example, a hosting provider's native Cron Jobs feature may invoke a protected Next.js route.

Requirements:

- Store schedules durably in MongoDB.
- Use UTC internally and preserve the user's selected time zone for display.
- Query due jobs using indexed fields.
- Use atomic claims or another reliable concurrency-control mechanism.
- Prevent duplicate execution.
- Handle expired locks and interrupted executions.
- Record publication attempts.
- Apply safe retry policies.
- Reconcile ambiguous outcomes before retrying.
- Enforce a batch limit.
- Secure the endpoint with a strong secret or equivalent authentication.
- Never allow a public request to publish arbitrary jobs.
- Expose execution status and last-run information to administrators.
- Document deployment-specific configuration and limitations.

Do not assume a hosting provider supports the required frequency or execution duration. Verify its current documentation and plan restrictions.

## Honest fallback

If neither native scheduling nor a configured, reliable hosting-provided scheduled invocation is available, the application must not claim that automatic publication works.

It may allow the user to save a proposed publication date, display it in the calendar, and mark it clearly as awaiting scheduling configuration. Do not represent that item as an active, automatically scheduled publication.

Do not create a fake `PublishJob` worker that is never executed.

# 13. Calendar

Create a complete content calendar.

Include:

- Month view.
- Week view.
- Day view.
- Previous and next navigation.
- Current date navigation.
- Time-zone-aware date and time display.
- Platform filters.
- Account filters.
- Publication status filters.
- Drafts.
- Published posts.
- Scheduled posts with real execution mechanisms.
- Unschedulable planned posts with an explicit status.
- Post details.
- Edit and duplicate actions where appropriate.
- Reschedule and cancel actions only when the underlying publication mechanism supports them.

Use clear status indicators and accessible colors.

Do not imply that a planned publication will execute automatically if no reliable scheduler is configured.

# 14. Analytics

Implement real analytics where the selected account, platform, scopes, and Social SDK adapter support them.

Investigate actual SDK methods and platform limitations before building analytics views.

Potential metrics include:

- Published posts.
- Views or impressions.
- Likes.
- Comments.
- Shares.
- Engagement rate.
- Follower counts.
- Reach.
- Video performance.

Only display a metric when the API actually returns it and the metric's meaning is understood.

For every analytics request:

1. Authenticate the user.
2. Verify account ownership.
3. Verify the required scopes and capability.
4. Fetch data using the SDK or supported API.
5. Normalize the data carefully.
6. Persist historical snapshots when useful and permitted.
7. Display the retrieval timestamp and available date range.
8. Handle unavailable, incomplete, or stale data transparently.

Do not invent historical metrics or fill missing values with fabricated numbers.

If an adapter does not support a requested metric, show an explanation and link to the relevant capability documentation.

Use meaningful charts and tables, with appropriate date-range filters.

# 15. Comments and Community Management

Investigate the current SDK capability manifests for comments, replies, and moderation for each supported platform.

Implement only supported operations.

Where available, include:

- Comment list.
- Pagination.
- Account and post filters.
- Reply to comment.
- Mark as read or handled locally.
- Moderation actions where explicitly supported.
- Links to the original platform content.
- Clear error and permission states.

Do not claim universal cross-platform inbox support if some platforms lack the necessary APIs or SDK adapters.

If a capability is unavailable, explain the limitation rather than rendering fake comments.

# 16. Notifications

Implement a persistent, user-scoped in-app notification system.

Possible notifications include:

- Successful publication.
- Failed publication.
- Partial multi-platform success.
- Ambiguous publication requiring reconciliation.
- Account authorization expired.
- Account disconnected or permissions revoked.
- Upload completed or failed.
- Scheduling configuration missing.
- Scheduled publication awaiting execution, when relevant.

Include:

- Notification list.
- Unread count.
- Mark as read.
- Mark all as read.
- Link to the related resource.
- Pagination or incremental loading.

Do not create false notifications for events that never occurred.

Use Resend for transactional email notifications only when appropriate and configured. Avoid sending unnecessary emails.

# 17. Database Models

Design typed Mongoose models with timestamps, validation, appropriate indexes, and explicit ownership fields.

Create models as needed for:

## User

- Name.
- Normalized email.
- Password hash or authentication-provider identity.
- Email verification status.
- Profile settings.
- Theme preference.
- Time zone.
- Account status.
- Timestamps.

## SocialAccount

- Owner or workspace ID.
- Platform.
- Backend/adapter identifier.
- Stable provider account ID.
- Display name and handle.
- Profile image URL where available.
- Account type where available.
- Granted scopes.
- Connection status.
- Token metadata and reference to securely stored credentials.
- Token revision.
- Last successful synchronization.
- Timestamps.

## OAuthAttempt

- Owner or workspace ID.
- Authenticated principal.
- Platform.
- Attempt identifier.
- State metadata or secure state reference.
- Expiration.
- Status.
- Discovered accounts or references.
- Consumption timestamp.

Never store authorization attempts as reusable, unprotected bearer credentials.

## Credential

- Owner or workspace ID.
- Social account identity.
- Encrypted access token.
- Encrypted refresh token when available.
- Encryption key version.
- Expiration metadata.
- Scopes.
- Token revision.
- Updated timestamp.

Never store plaintext access or refresh tokens.

## Post

- Owner or workspace ID.
- Content.
- Draft or publication state.
- Media references.
- Destination references.
- Scheduled or planned timestamp.
- Time zone.
- Creator identity.
- Timestamps.

## PostDestination / Publication

- Parent post.
- Destination account.
- Platform.
- Status.
- Provider delivery reference.
- Native post identifier and URL when available.
- Actual result.
- Error code and safe error details.
- Attempt count.
- Publication timestamp.
- Reconciliation status.

## MediaAsset

- Owner or workspace ID.
- Storage path.
- File metadata.
- Type.
- Size.
- Dimensions or duration where applicable.
- Upload status.
- Timestamps.

## PublishAttempt

- Publication identity.
- Destination.
- Idempotency key or reference.
- Attempt state.
- Safe error details.
- Start and completion timestamps.
- Reconciliation information.

## PublishJob

Create this model only if a real execution mechanism exists. Do not implement a nonfunctional job model merely to make the UI appear complete.

## Notification

- Owner.
- Type.
- Message.
- Read state.
- Related resource.
- Creation timestamp.

## EmailVerification

Use only if the chosen authentication library does not already provide a suitable secure mechanism.

## WebhookEvent

Use where a supported provider webhook is implemented. Include event identity, verification status, processing status, and idempotency information.

## AuditLog

Record relevant security-sensitive events without including passwords, tokens, verification codes, or other secrets.

Create indexes for ownership, platform account identifiers, publication status, due dates, pagination, and other actual query patterns.

Handle Mongoose connection reuse correctly in Next.js serverless environments.

# 18. Credential Encryption and Token Refresh

Implement application-level encryption for stored social credentials.

Use authenticated encryption, such as AES-256-GCM, with a dedicated server-side encryption key.

Requirements:

- Store encryption keys only in environment variables or a suitable server-side secret store.
- Never use a user's password directly as the encryption key.
- Include an encryption key version to support rotation.
- Validate decrypted data and handle decryption errors safely.
- Never log token values.
- Restrict credential access to the integration service.
- Verify tenant and account ownership before reading credentials.
- Persist token refreshes atomically.
- Prevent concurrent refresh races.
- Update token revisions when credentials change.
- Handle provider revocation and refresh failures.
- Prompt reconnection when refresh is impossible.

Use the SDK's documented token refresh functions where available. Do not assume every provider returns a refresh token or supports the same refresh lifecycle.

Do not implement a universal refresh algorithm that ignores provider differences.

# 19. Security Requirements

Implement appropriate protections against:

- Cross-user data access.
- Broken object-level authorization.
- CSRF where applicable.
- OAuth state forgery.
- OAuth callback replay.
- Open redirects.
- SSRF through user-controlled media URLs.
- XSS.
- NoSQL injection.
- Malicious file uploads.
- Brute-force login and verification attempts.
- Session fixation.
- Credential leakage.
- Webhook spoofing.
- Duplicate publication.
- Unauthorized scheduled execution.
- Excessive API requests.
- Sensitive information in logs.

Use:

- Zod validation at server boundaries.
- Explicit authorization checks.
- Safe error messages.
- Rate limiting for sensitive operations.
- Secure cookie configuration.
- Exact redirect allowlists.
- Proper webhook signature verification using raw request bytes.
- Environment validation at startup.
- Security-conscious HTTP headers where appropriate.
- Safe database query patterns.
- Appropriate CSRF protection for the chosen authentication model.

Do not assume that authentication alone grants permission to access a resource.

Create `docs/SECURITY.md` documenting the security model, threat assumptions, credential encryption, OAuth lifecycle, token storage, tenant isolation, file access, and incident-handling recommendations.

# 20. Webhooks and Synchronization

Implement provider webhooks only where supported by the actual adapter and platform.

Requirements:

- Verify signatures before parsing or trusting the event.
- Read the raw request body where required.
- Validate timestamps or replay protections when supported.
- Deduplicate events.
- Persist accepted events before acknowledging them when reliability requires it.
- Process events idempotently.
- Scope resulting changes to the correct user and account.
- Handle provider retries.
- Log safe event metadata without secrets.

Do not invent webhook event types or claim webhook support for platforms that lack an implemented integration.

If webhooks are unavailable, use user-triggered refresh or another documented, rate-limited synchronization method.

# 21. API and Service Design

Create clean service boundaries for:

- Authentication.
- User profile management.
- OAuth connections.
- Credential encryption.
- Account synchronization.
- Content creation.
- Publishing.
- Publication reconciliation.
- Scheduling.
- Media storage.
- Analytics.
- Comments.
- Notifications.
- Email.
- Audit logging.

Use typed request and response contracts.

Standardize safe error handling without swallowing meaningful SDK error codes.

Use the SDK's documented structured errors and outcomes. Do not invent error types or replace useful provider errors with generic success responses.

Keep secrets and internal provider details out of client-facing responses.

Implement pagination for potentially large collections. Use appropriate indexes and bounded result sizes.

# 22. Environment Configuration

Create a complete `.env.example`.

Include all required configuration categories, using descriptive placeholders:

```dotenv
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=

AUTH_SECRET=
CREDENTIAL_ENCRYPTION_KEY=
CREDENTIAL_ENCRYPTION_KEY_VERSION=1

GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=

META_APP_ID=
META_APP_SECRET=

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

X_CLIENT_ID=
X_CLIENT_SECRET=

CRON_SECRET=
```

This is a starting template, not a claim that every variable is required or that these exact names match every adapter. Inspect the current SDK and authentication APIs and adjust the names accordingly.

Separate local development and production configuration.

Validate required variables on the server. Fail with a clear configuration error when a necessary variable is missing.

Do not put OAuth secrets, encryption keys, database credentials, Resend API keys, Supabase service-role keys, or cron secrets in `NEXT_PUBLIC_` variables.

Do not commit `.env.local` or real secrets.

# 23. Testing Strategy

Build a meaningful automated test suite.

## Unit tests

Test:

- Zod schemas.
- Authentication helpers.
- Authorization policies.
- Tenant isolation.
- Encryption and decryption.
- Token expiry logic.
- Time-zone conversion.
- Publication state transitions.
- Capability checks.
- File validation.
- Idempotency behavior.
- Retry and reconciliation rules.

## Integration tests

Test:

- MongoDB models and ownership-scoped queries.
- Registration and email verification.
- Password reset.
- OAuth attempt persistence.
- Callback validation.
- Account selection.
- Credential encryption and persistence.
- Publishing service behavior with mocked providers.
- Publication outcome persistence.
- Media authorization.
- Notification creation.
- Protected cron endpoint behavior.
- Webhook signature verification where implemented.

## End-to-end tests

Cover at least:

1. Registration.
2. Email verification.
3. Login and logout.
4. Password recovery.
5. Empty dashboard.
6. Social connection initiation and callback using mocks.
7. Account list and disconnect.
8. Draft creation and editing.
9. Media upload.
10. Publishing success and failure using mocked providers.
11. Partial multi-platform publication.
12. Ambiguous publication reconciliation.
13. Calendar navigation.
14. Unsupported capability handling.
15. Cross-user access denial.

Never send actual social posts or emails in the default test suite.

Use the Social SDK's documented testing backend and fixtures where appropriate.

Clearly distinguish mocked integration tests from live tests using approved social accounts. Do not claim live verification unless it was actually performed.

# 24. Documentation and Open Source

Create or update:

- `README.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `.env.example`
- `docs/ARCHITECTURE.md`
- `docs/PLATFORM-CAPABILITIES.md`
- `docs/SOCIAL-SDK-IMPLEMENTATION.md`
- `docs/SECURITY.md`
- `docs/DEPLOYMENT.md`
- `docs/SCHEDULING.md`

Inspect the repository for an existing license before changing it. If no license exists and no repository constraint conflicts, use the MIT License.

The README should include:

- Product overview.
- Features.
- Screenshots when available.
- Tech stack.
- Prerequisites.
- Local setup.
- Environment configuration.
- MongoDB setup.
- Supabase Storage setup.
- Resend configuration.
- Social developer application setup for all six platforms.
- OAuth callback configuration.
- Platform approval requirements.
- Database initialization.
- Development commands.
- Testing.
- Production build.
- Deployment.
- Scheduling limitations.
- Security notes.
- Contribution instructions.
- License.

Document each platform's real capability limitations and required scopes.

Do not promise that users can publish through an unapproved platform application. Explain the setup required for production use.

# 25. Deployment

Prepare the application for deployment to a compatible Node.js hosting environment.

Requirements:

- Supported Node.js version for the installed Social SDK.
- Correct ESM configuration.
- Production environment validation.
- Persistent MongoDB connectivity.
- Supabase Storage setup.
- Resend sender configuration.
- Registered OAuth callback URLs.
- Secure HTTPS in production.
- Correct application URL and trusted redirect configuration.
- Database indexes.
- Appropriate runtime settings.
- Production logging and safe error reporting.
- Hosting-specific scheduling configuration only when supported.
- Deployment documentation.

Do not assume that every hosting provider supports the same cron frequency, execution duration, or runtime capabilities.

Provide a deployment checklist that distinguishes required configuration from optional features.

# 26. Development Workflow and Quality Standards

Implement the project incrementally, but complete the application rather than stopping after scaffolding.

Recommended phases:

**Phase 1 — Inspection and architecture**
- Inspect the repository and `SOCIAL-SDK.md`.
- Verify package APIs and capabilities.
- Define architecture and implementation checklist.
- Identify environment requirements.

**Phase 2 — Foundation**
- Configure Next.js, TypeScript, Tailwind, and shadcn/ui.
- Establish database connectivity.
- Set up authentication and shared application components.
- Implement the design system.

**Phase 3 — Authentication**
- Registration.
- Resend verification.
- Login.
- Password recovery.
- Sessions and authorization.

**Phase 4 — Social connections**
- OAuth providers.
- Persistent connection store.
- Credential encryption.
- Account discovery and selection.
- Connected Accounts interface.
- Reconnection and disconnection.

**Phase 5 — Content and publishing**
- Composer.
- Media uploads.
- Drafts.
- Real publishing.
- Per-platform outcomes.
- Idempotency and reconciliation.

**Phase 6 — Calendar and analytics**
- Capability-aware calendar.
- Real analytics where available.
- Explicit handling of unavailable scheduling and metrics.

**Phase 7 — Notifications and community**
- Persistent in-app notifications.
- Supported comment operations.
- Webhooks and synchronization where supported.

**Phase 8 — Security, tests, and documentation**
- Tenant isolation tests.
- Integration and end-to-end tests.
- Documentation.
- Production build and deployment verification.

After each phase:

1. Run relevant tests.
2. Fix TypeScript and lint errors.
3. Verify that existing functionality still works.
4. Update the checklist.
5. Continue to the next phase.

Do not stop to ask for permission after every phase. Continue autonomously unless a genuinely missing credential, unavailable required file, or external approval blocks further work.

# 27. Definition of Done

The project is complete only when all applicable requirements below are met.

- [ ] The app runs locally using documented setup instructions.
- [ ] TypeScript strict mode passes.
- [ ] Authentication and email verification work with configured credentials.
- [ ] Password recovery works.
- [ ] User data is properly isolated.
- [ ] OAuth flows are implemented for the six selected platforms to the extent supported by the verified SDK and platform requirements.
- [ ] Account discovery and selection use validated server-side data.
- [ ] Social credentials are encrypted at rest.
- [ ] Users can upload and manage authorized media.
- [ ] Users can save, edit, and delete drafts.
- [ ] Real publishing is implemented for verified supported operations.
- [ ] Publication outcomes are recorded per destination.
- [ ] Duplicate publication protections are implemented.
- [ ] Unsupported operations are clearly identified.
- [ ] The calendar distinguishes active automatic scheduling from a planned date.
- [ ] No unsupported external scheduler is used.
- [ ] Analytics show only real, supported data.
- [ ] Notifications reflect actual events.
- [ ] UI is responsive and accessible.
- [ ] Light and dark modes work.
- [ ] Automated tests pass.
- [ ] Production build succeeds.
- [ ] `.env.example` is complete and contains no real secrets.
- [ ] Documentation covers setup, OAuth, capabilities, security, and deployment.
- [ ] No core feature is represented by fake data or a nonfunctional button.
- [ ] No paid subscription system or premium feature tiers have been added.

# Final Instructions

Build the actual application in the existing repository.

Do not respond with only an architecture proposal, code snippets, or a list of suggested files.

Inspect the repository first, read `SOCIAL-SDK.md`, verify current documentation, implement the application, run the available checks, and fix the problems you find.

If a required third-party credential or platform approval is unavailable, implement the surrounding flow, provide safe configuration handling, and document exactly what remains blocked. Do not fabricate successful external connections or publishing results.

At completion, provide a concise implementation report covering:

1. What was implemented.
2. The main architectural decisions.
3. The six platforms and the verified operations supported for each.
4. Required environment variables and developer-console setup.
5. Tests and build checks executed, with their actual results.
6. Deployment instructions.
7. Any limitations or external approvals still required.

Be accurate, security-conscious, and thorough. The goal is a real, maintainable, open-source social media management platform—not a visual prototype.