# Scheduling

No external schedulers (no Inngest, Trigger.dev, QStash, paid queues). Two honest paths:

## 1. Native scheduling

Only when the direct adapter documents it. Currently: **YouTube (partial)**. Never pass `schedule` to other adapters. Capability is rechecked per installed SDK version in `src/lib/social/capabilities.ts`.

## 2. Hosting-provided cron

A deployment cron (e.g. Vercel Cron) calls `GET /api/cron/publish` with `Authorization: Bearer $CRON_SECRET`.

- Schedules stored durably in MongoDB (UTC internally, user timezone for display).
- Due jobs claimed atomically (indexed queries, locks with expiry, batch limits).
- No duplicate execution; ambiguous outcomes reconcile before retry; attempts recorded.
- Endpoint never publishes arbitrary jobs — only due, owned, capability-checked destinations.

## Fallback

If neither path is configured, dates are saved as **planned** and badged as awaiting scheduling configuration — visible in the calendar, never represented as automatic. There is no fake `PublishJob` worker.

Configure frequency/duration per hosting docs; verify plan limits before promising cadence.
