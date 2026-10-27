import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  cookieSet: vi.fn(),
  cookieDelete: vi.fn(),
  revokedUpdateOne: vi.fn(),
  revokedExists: vi.fn(),
  userLean: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (mocks.cookieValue ? { value: mocks.cookieValue } : undefined),
    set: mocks.cookieSet,
    delete: mocks.cookieDelete,
  }),
}));
vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/models/Session", () => ({
  RevokedSession: { updateOne: mocks.revokedUpdateOne, exists: mocks.revokedExists },
}));
vi.mock("@/models/User", () => ({
  User: {
    findById: () => ({ select: () => ({ lean: mocks.userLean }) }),
  },
}));

import { activeSessionUserId, createSession, revokeCurrentSession } from "./session";

const SECRET = "a".repeat(32);

async function issueToken() {
  await createSession("user-1", 0);
  const token = mocks.cookieSet.mock.calls[0][1] as string;
  mocks.cookieValue = token;
  return token;
}

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", SECRET);
});

afterEach(() => {
  vi.clearAllMocks();
  mocks.cookieValue = undefined;
  vi.unstubAllEnvs();
});

describe("per-session logout revocation", () => {
  it("adds the current jti to the denylist with the token's own expiry", async () => {
    const token = await issueToken();
    mocks.revokedUpdateOne.mockResolvedValue({});

    await expect(revokeCurrentSession()).resolves.toBe(true);

    const filter = mocks.revokedUpdateOne.mock.calls[0][0] as { jti: string };
    const update = mocks.revokedUpdateOne.mock.calls[0][1] as {
      $setOnInsert: { jti: string; expiresAt: Date };
    };
    expect(filter.jti).toBe(update.$setOnInsert.jti);
    expect(update.$setOnInsert.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(token).toContain(".");
  });

  it("does nothing when there is no session cookie", async () => {
    mocks.cookieValue = undefined;

    await expect(revokeCurrentSession()).resolves.toBe(false);
    expect(mocks.revokedUpdateOne).not.toHaveBeenCalled();
  });

  it("rejects a revoked token even when the signature and user status are valid", async () => {
    await issueToken();
    mocks.userLean.mockResolvedValue({ status: "active", sessionVersion: 0 });
    mocks.revokedExists.mockResolvedValue(null);
    await expect(activeSessionUserId()).resolves.toBe("user-1");

    mocks.revokedExists.mockResolvedValue({ _id: "revoked-1" });
    await expect(activeSessionUserId()).resolves.toBeNull();
  });

  it("still rejects a token after the user's session version moves on", async () => {
    await issueToken();
    mocks.userLean.mockResolvedValue({ status: "active", sessionVersion: 1 });
    mocks.revokedExists.mockResolvedValue(null);

    await expect(activeSessionUserId()).resolves.toBeNull();
  });
});
