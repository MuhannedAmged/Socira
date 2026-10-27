import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOneAndUpdate: vi.fn(),
  updateMany: vi.fn(),
  userUpdateOne: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("@/models/library", () => ({
  PasswordReset: {
    findOneAndUpdate: mocks.findOneAndUpdate,
    updateMany: mocks.updateMany,
  },
}));

vi.mock("@/models/User", () => ({
  User: { updateOne: mocks.userUpdateOne },
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: mocks.hashPassword,
}));

import { consumePasswordReset } from "./password-reset";

function tokenResult(record: unknown) {
  return { lean: async () => record };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("atomic password reset", () => {
  it("claims the token once, rotates the password, and bumps the session version", async () => {
    mocks.findOneAndUpdate.mockReturnValue(tokenResult({ userId: "user-1" }));
    mocks.hashPassword.mockResolvedValue("new-hash");
    mocks.userUpdateOne.mockResolvedValue({ matchedCount: 1 });
    mocks.updateMany.mockResolvedValue({});

    await expect(consumePasswordReset("a".repeat(32), "correct horse battery staple")).resolves.toBe("ok");

    const filter = mocks.findOneAndUpdate.mock.calls[0][0];
    expect(filter).toMatchObject({ consumedAt: null, expiresAt: { $gt: expect.any(Date) } });
    expect(mocks.findOneAndUpdate.mock.calls[0][1]).toMatchObject({ $set: { consumedAt: expect.any(Date) } });
    expect(mocks.userUpdateOne).toHaveBeenCalledWith(
      { _id: "user-1" },
      { $set: { passwordHash: "new-hash" }, $inc: { sessionVersion: 1 } },
    );
    expect(mocks.updateMany).toHaveBeenCalledWith(
      { userId: "user-1", consumedAt: null },
      { $set: { consumedAt: expect.any(Date) } },
    );
  });

  it("does not touch the password when the token was already consumed", async () => {
    mocks.findOneAndUpdate.mockReturnValue(tokenResult(null));

    await expect(consumePasswordReset("b".repeat(32), "another password")).resolves.toBe("invalid");

    expect(mocks.hashPassword).not.toHaveBeenCalled();
    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("lets only one of two concurrent requests win the token", async () => {
    mocks.findOneAndUpdate
      .mockReturnValueOnce(tokenResult({ userId: "user-1" }))
      .mockReturnValueOnce(tokenResult(null));
    mocks.hashPassword.mockResolvedValue("new-hash");
    mocks.userUpdateOne.mockResolvedValue({ matchedCount: 1 });
    mocks.updateMany.mockResolvedValue({});

    const [first, second] = await Promise.all([
      consumePasswordReset("c".repeat(32), "first password"),
      consumePasswordReset("c".repeat(32), "second password"),
    ]);

    expect([first, second].sort()).toEqual(["invalid", "ok"]);
    expect(mocks.userUpdateOne).toHaveBeenCalledTimes(1);
  });
});
