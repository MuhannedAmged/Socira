/* Simple in-memory rate limiter for auth endpoints (per-instance). For multi-instance, use Redis. */

const hits = new Map<string, { count: number; reset: number }>();
const MAX_ENTRIES = 10_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000 && hits.size < MAX_ENTRIES) return;
  lastSweep = now;
  for (const [key, entry] of hits) {
    if (entry.reset < now) hits.delete(key);
  }
  // Still oversized: drop the oldest insertions so memory stays bounded under key floods.
  while (hits.size > MAX_ENTRIES) {
    const oldest = hits.keys().next().value;
    if (oldest === undefined) break;
    hits.delete(oldest);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  sweep(now);
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  entry.count += 1;
  if (entry.count > limit) return { ok: false, remaining: 0 };
  return { ok: true, remaining: limit - entry.count };
}
