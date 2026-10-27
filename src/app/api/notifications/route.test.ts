import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeSessionUserId: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/lib/auth/session", () => ({ activeSessionUserId: mocks.activeSessionUserId }));
vi.mock("@/models/library", () => ({ Notification: { updateMany: mocks.updateMany } }));

import { PATCH } from "./route";

function patch(origin: string) {
  return new Request("https://socira.example/api/notifications", {
    method: "PATCH",
    headers: { origin },
  });
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("mark-all-read CSRF guard", () => {
  it("rejects a cross-origin PATCH without touching notifications", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://socira.example");
    mocks.activeSessionUserId.mockResolvedValue("user-1");

    const response = await PATCH(patch("https://evil.example"));

    expect(response.status).toBe(403);
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("allows the configured same origin and scopes the update to the caller", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://socira.example");
    mocks.activeSessionUserId.mockResolvedValue("user-1");
    mocks.updateMany.mockResolvedValue({ modifiedCount: 2 });

    const response = await PATCH(patch("https://socira.example"));

    expect(response.status).toBe(200);
    expect(mocks.updateMany).toHaveBeenCalledWith(
      { ownerId: "user-1", read: false },
      { $set: { read: true } },
    );
  });
});
