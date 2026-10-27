import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindOne: vi.fn(),
  userUpdateOne: vi.fn(),
  verificationFindOneAndUpdate: vi.fn(),
  verificationExists: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/lib/rate-limit/memory", () => ({ rateLimit: vi.fn(() => ({ ok: true })) }));
vi.mock("@/lib/http/request", () => ({
  crossOriginBlock: vi.fn(() => null),
  rateKey: vi.fn((scope: string) => scope),
}));
vi.mock("@/models/User", () => ({
  User: { findOne: mocks.userFindOne, updateOne: mocks.userUpdateOne },
}));
vi.mock("@/models/library", () => ({
  EmailVerification: {
    findOneAndUpdate: mocks.verificationFindOneAndUpdate,
    exists: mocks.verificationExists,
  },
}));

import { POST } from "./route";

const CODE = "123456";
const CODE_HASH = createHash("sha256").update(CODE).digest("hex");
const USER = { _id: "user-1" };

function request(code = CODE, email = "person@example.com") {
  return new Request("https://socira.example/api/auth/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("email verification attempt accounting", () => {
  it("returns a neutral response for an unknown account", async () => {
    mocks.userFindOne.mockResolvedValue(null);

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mocks.verificationFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it("increments with a conditional update so the attempt cap cannot be raced", async () => {
    mocks.userFindOne.mockResolvedValue(USER);
    mocks.verificationFindOneAndUpdate.mockResolvedValueOnce({
      _id: "record-1",
      codeHash: CODE_HASH,
    });
    mocks.verificationFindOneAndUpdate.mockResolvedValueOnce({ _id: "record-1" });
    mocks.userUpdateOne.mockResolvedValue({});

    const response = await POST(request());

    expect(response.status).toBe(200);
    const filter = mocks.verificationFindOneAndUpdate.mock.calls[0][0];
    expect(filter).toMatchObject({
      userId: "user-1",
      consumedAt: null,
      attempts: { $lt: 6 },
    });
    expect(mocks.verificationFindOneAndUpdate.mock.calls[0][1]).toEqual({ $inc: { attempts: 1 } });
    expect(mocks.userUpdateOne).toHaveBeenCalledWith(
      { _id: "user-1" },
      { $set: { emailVerified: true } },
    );
  });

  it("rejects a wrong code after counting the attempt", async () => {
    mocks.userFindOne.mockResolvedValue(USER);
    mocks.verificationFindOneAndUpdate.mockResolvedValue({
      _id: "record-1",
      codeHash: createHash("sha256").update("999999").digest("hex"),
    });

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mocks.verificationFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
  });

  it("reports an exhausted code as rate-limited", async () => {
    mocks.userFindOne.mockResolvedValue(USER);
    mocks.verificationFindOneAndUpdate.mockResolvedValue(null);
    mocks.verificationExists.mockResolvedValue({ _id: "record-1" });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
  });

  it("never verifies the account twice when two correct requests race", async () => {
    mocks.userFindOne.mockResolvedValue(USER);
    mocks.verificationFindOneAndUpdate.mockResolvedValueOnce({
      _id: "record-1",
      codeHash: CODE_HASH,
    });
    mocks.verificationFindOneAndUpdate.mockResolvedValueOnce(null);

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mocks.userUpdateOne).not.toHaveBeenCalled();
  });
});
