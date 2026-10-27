# Deployment checklist

- [ ] Node.js version matching `@opencoredev/social-sdk` requirements; Next.js production build passes.
- [ ] `MONGODB_URI` reachable; indexes built (Mongoose auto-indexes on first connect).
- [ ] Supabase bucket from `SUPABASE_STORAGE_BUCKET` exists and is **private**.
- [ ] Set the bucket's **file size limit** (at least 25 MB for images / 512 MB for video) and **allowed MIME types** (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, `video/quicktime`, `video/webm`). Signed uploads bypass the app's declared-metadata checks, so the bucket is the enforcing boundary.
- [ ] Resend sender domain verified; `RESEND_FROM_EMAIL` uses it.
- [ ] `NEXT_PUBLIC_APP_URL` is the exact HTTPS origin; OAuth callback URLs registered per platform console:
  - `https://your-app/api/social/callback`
  - Password-reset emails are built only from this origin. If it is missing or not HTTPS in production, reset emails are not sent (the endpoint fails closed); it is never inferred from the request `Host`.
  - Scopes per `docs/PLATFORM-CAPABILITIES.md`; complete Meta/Google/LinkedIn/TikTok/X app review where required.
- [ ] `AUTH_SECRET` (32+ random bytes), `CREDENTIAL_ENCRYPTION_KEY` (32-byte base64), `CRON_SECRET` set — none in `NEXT_PUBLIC_*`.
- [ ] Hosting cron configured for `/api/cron/publish` **only if** you want non-native scheduling; otherwise the UI correctly shows planned dates.
- [ ] Hosting cron configured daily for `/api/cron/media-cleanup` with `Authorization: Bearer $CRON_SECRET`. This is what actually deletes media from Supabase after 3 days; without it, expired assets are hidden from the library but remain in the bucket.
- [ ] `npm run build` green; logs contain no secrets; error reporting wired.
