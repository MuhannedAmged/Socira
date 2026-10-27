import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeSessionUserId: vi.fn(),
  findOneAndDelete: vi.fn(),
  create: vi.fn(),
  storageRemove: vi.fn(),
  storageInfo: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/lib/auth/session", () => ({ activeSessionUserId: mocks.activeSessionUserId }));
vi.mock("@/models/library", () => ({
  MediaAsset: { findOneAndDelete: mocks.findOneAndDelete, create: mocks.create },
}));
vi.mock("@/lib/storage/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/storage/supabase")>();
  return {
    ...actual,
    supabaseAdmin: () => ({
      storage: {
        from: () => ({ remove: mocks.storageRemove, info: mocks.storageInfo }),
      },
    }),
  };
});

import { DELETE, POST } from "./route";

const ASSET_ID = "507f1f77bcf86cd799439011";

function request() {
  return new Request("https://socira.example/api/media", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: ASSET_ID }),
  });
}

function uploadRequest(overrides: Record<string, unknown> = {}) {
  return new Request("https://socira.example/api/media", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      path: "user-a/photo.jpg",
      mime: "image/jpeg",
      size: 1234,
      ...overrides,
    }),
  });
}

beforeEach(() => {
  // Keep the email-verification gate off unless a test opts into it.
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_FROM_EMAIL", "");
});

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

describe("media recording verifies the stored object", () => {
  it("rejects when the object cannot be found", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.storageInfo.mockResolvedValue({ data: null, error: { message: "not found" } });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(404);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.storageRemove).not.toHaveBeenCalled();
  });

  it("deletes an object whose real size differs from the declared size", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.storageInfo.mockResolvedValue({
      data: { size: 9999, contentType: "image/jpeg" },
      error: null,
    });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(409);
    expect(mocks.storageRemove).toHaveBeenCalledWith(["user-a/photo.jpg"]);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("deletes an object whose real MIME type differs from the declared type", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.storageInfo.mockResolvedValue({
      data: { size: 1234, contentType: "text/html" },
      error: null,
    });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(409);
    expect(mocks.storageRemove).toHaveBeenCalledWith(["user-a/photo.jpg"]);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("deletes an object with incomplete metadata instead of trusting it", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.storageInfo.mockResolvedValue({ data: { size: 1234 }, error: null });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(409);
    expect(mocks.storageRemove).toHaveBeenCalledWith(["user-a/photo.jpg"]);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("records an object only after size and type match", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.storageInfo.mockResolvedValue({
      data: { size: 1234, contentType: "image/jpeg" },
      error: null,
    });
    mocks.create.mockResolvedValue({ _id: "asset-1", storagePath: "user-a/photo.jpg" });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: "user-a",
        storagePath: "user-a/photo.jpg",
        mime: "image/jpeg",
        size: 1234,
      }),
    );
  });

  it("rejects a path outside the caller's prefix before touching storage", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");

    const response = await POST(uploadRequest({ path: "user-b/photo.jpg" }));

    expect(response.status).toBe(403);
    expect(mocks.storageInfo).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
