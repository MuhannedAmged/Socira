import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeSessionUserId: vi.fn(),
  findOneAndDelete: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/lib/auth/session", () => ({ activeSessionUserId: mocks.activeSessionUserId }));
vi.mock("@/models/SocialAccount", () => ({
  SocialAccount: { findOneAndDelete: mocks.findOneAndDelete },
}));
vi.mock("@/models/Credential", () => ({ Credential: { deleteMany: vi.fn(async () => ({})) } }));
vi.mock("@/models/library", () => ({ AuditLog: { create: vi.fn(async () => ({})) } }));

import { DELETE } from "./route";

const ACCOUNT_ID = "507f1f77bcf86cd799439011";

afterEach(() => {
  vi.clearAllMocks();
});

describe("account disconnect ownership", () => {
  it("only deletes a connection owned by the session user", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.findOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
      new Request("https://socira.example/api/accounts", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: ACCOUNT_ID }),
      }),
    );

    expect(response.status).toBe(404);
    expect(mocks.findOneAndDelete).toHaveBeenCalledWith({ _id: ACCOUNT_ID, ownerId: "user-a" });
  });
});
