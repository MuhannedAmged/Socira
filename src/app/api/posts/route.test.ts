import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeSessionUserId: vi.fn(),
  userLean: vi.fn(),
  accountFind: vi.fn(),
  postCreate: vi.fn(),
  postDeleteOne: vi.fn(),
  destinationInsertMany: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/lib/auth/session", () => ({ activeSessionUserId: mocks.activeSessionUserId }));
vi.mock("@/models/User", () => ({
  User: { findById: () => ({ select: () => ({ lean: mocks.userLean }) }) },
}));
vi.mock("@/models/SocialAccount", () => ({
  SocialAccount: { find: mocks.accountFind },
}));
vi.mock("@/models/Post", () => ({
  Post: { create: mocks.postCreate, deleteOne: mocks.postDeleteOne },
  PostDestination: { insertMany: mocks.destinationInsertMany },
}));

import { POST } from "./route";

const ACCOUNT_ID = "507f1f77bcf86cd799439011";

function request() {
  return new Request("https://socira.example/api/posts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "hello", accountIds: [ACCOUNT_ID], status: "draft" }),
  });
}

function foundAccounts(accounts: unknown[]) {
  return { lean: async () => accounts };
}

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_FROM_EMAIL", "");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("post destination ownership", () => {
  it("rejects an account that does not belong to the caller", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.accountFind.mockReturnValue(foundAccounts([]));

    const response = await POST(request());

    expect(response.status).toBe(403);
    const filter = mocks.accountFind.mock.calls[0][0];
    expect(filter).toMatchObject({ ownerId: "user-a", _id: { $in: [ACCOUNT_ID] } });
    expect(mocks.postCreate).not.toHaveBeenCalled();
    expect(mocks.destinationInsertMany).not.toHaveBeenCalled();
  });

  it("blocks an unverified account when email verification is enforced", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.userLean.mockResolvedValue({ emailVerified: false });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(mocks.accountFind).not.toHaveBeenCalled();
    expect(mocks.postCreate).not.toHaveBeenCalled();
  });

  it("stores both post and destinations with the caller as owner", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.accountFind.mockReturnValue(foundAccounts([{ _id: ACCOUNT_ID, platform: "x" }]));
    mocks.postCreate.mockResolvedValue({ _id: "post-1" });
    mocks.destinationInsertMany.mockResolvedValue([{ _id: "dest-1" }]);

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.postCreate).toHaveBeenCalledWith(expect.objectContaining({ ownerId: "user-a" }));
    expect(mocks.destinationInsertMany).toHaveBeenCalledWith([
      expect.objectContaining({ ownerId: "user-a", postId: "post-1", socialAccountId: ACCOUNT_ID }),
    ]);
  });

  it("removes the half-created post when destinations cannot be written", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-a");
    mocks.accountFind.mockReturnValue(foundAccounts([{ _id: ACCOUNT_ID, platform: "x" }]));
    mocks.postCreate.mockResolvedValue({ _id: "post-1" });
    mocks.destinationInsertMany.mockRejectedValue(new Error("write failed"));
    mocks.postDeleteOne.mockResolvedValue({});

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.postDeleteOne).toHaveBeenCalledWith({ _id: "post-1", ownerId: "user-a" });
  });
});
