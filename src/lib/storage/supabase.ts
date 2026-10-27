import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) throw new Error("Supabase server env is not configured.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function storageBucket(): string {
  return (process.env.SUPABASE_STORAGE_BUCKET ?? "").trim() || "socira-media";
}

/**
 * Only the configured media bucket may be touched with the service-role key. A bucket value read
 * from a database row is data, not authority; without this check a corrupted or tampered record
 * could direct a delete at an unrelated bucket the key can reach.
 */
export function isManagedBucket(bucket: string): boolean {
  return bucket === storageBucket();
}

export function userScopedPath(ownerId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const stamp = Date.now().toString(36);
  return `${ownerId}/${stamp}-${safe}`;
}
