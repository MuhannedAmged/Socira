/** Media retention: uploads are removed from Supabase Storage after three days. */
export const MEDIA_RETENTION_DAYS = 3;
export const MEDIA_RETENTION_MS = MEDIA_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function mediaExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + MEDIA_RETENTION_MS);
}

/**
 * Assets past their expiry. Documents created before `expiresAt` existed fall back
 * to their creation time, so an existing library still drains instead of lingering.
 */
export function expiredMediaFilter(now: Date = new Date()) {
  const cutoff = new Date(now.getTime() - MEDIA_RETENTION_MS);
  return {
    $or: [
      { expiresAt: { $lte: now } },
      { expiresAt: { $in: [null] }, createdAt: { $lte: cutoff } },
    ],
  };
}

/** The complement of `expiredMediaFilter`: assets that may still be listed and used. */
export function liveMediaFilter(now: Date = new Date()) {
  const cutoff = new Date(now.getTime() - MEDIA_RETENTION_MS);
  return {
    $or: [
      { expiresAt: { $gt: now } },
      { expiresAt: { $in: [null] }, createdAt: { $gt: cutoff } },
    ],
  };
}
