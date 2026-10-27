import { afterEach, describe, expect, it, vi } from "vitest";
import { isManagedBucket, storageBucket } from "./supabase";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("media bucket allowlist", () => {
  it("accepts only the configured bucket", () => {
    vi.stubEnv("SUPABASE_STORAGE_BUCKET", "socira-media");
    expect(storageBucket()).toBe("socira-media");
    expect(isManagedBucket("socira-media")).toBe(true);
    expect(isManagedBucket("another-bucket")).toBe(false);
  });

  it("uses the documented default when the env var is absent", () => {
    vi.stubEnv("SUPABASE_STORAGE_BUCKET", "");
    expect(storageBucket()).toBe("socira-media");
    expect(isManagedBucket("socira-media")).toBe(true);
  });
});
