import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeSessionUserId: vi.fn(),
  findOneAndDelete: vi.fn(),
  storageRemove: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/lib/auth/session", () => ({ activeSessionUserId: mocks.activeSessionUserId }));
vi.mock("@/models/library", () => ({
  MediaAsset: { findOneAndDelete: mocks.findOneAndDelete },
}));
vi.mock("@/lib/storage/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/storage/supabase")>();
  return {
    ...actual,
    supabaseAdmin: () => ({
      storage: { from: () => ({ remove: mocks.storageRemove }) },
    }),
  };
});

import { DELETE } from "./route";

const ASSET_ID = "507f1f77bcf86cd799439011";

function request() {
  return new Request("https://socira.example/api/media", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: ASSET_ID }),
  });
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("media deletion ownership and bucket scope", () => {
  it("scopes the delete to the caller", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.findOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(request());

    expect(response.status).toBe(404);
    expect(mocks.findOneAndDelete).toHaveBeenCalledWith({ _id: ASSET_ID, ownerId: "user-a" });
  });

  it("never sends a foreign bucket to the service-role storage client", async () => {
    vi.stubEnv("SUPABASE_STORAGE_BUCKET", "socira-media");
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.findOneAndDelete.mockResolvedValue({ bucket: "someone-elses-bucket", storagePath: "x" });

    const response = await DELETE(request());

    expect(response.status).toBe(200);
    expect(mocks.storageRemove).not.toHaveBeenCalled();
  });

  it("removes a managed object", async () => {
    vi.stubEnv("SUPABASE_STORAGE_BUCKET", "socira-media");
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.findOneAndDelete.mockResolvedValue({ bucket: "socira-media", storagePath: "user-a/x" });
    mocks.storageRemove.mockResolvedValue({ error: null });

    const response = await DELETE(request());

    expect(response.status).toBe(200);
    expect(mocks.storageRemove).toHaveBeenCalledWith(["user-a/x"]);
  });
});
