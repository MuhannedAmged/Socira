import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) throw new Error("Supabase server env is not configured.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function storageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "socira-media";
}

export function userScopedPath(ownerId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const stamp = Date.now().toString(36);
  return `${ownerId}/${stamp}-${safe}`;
}
