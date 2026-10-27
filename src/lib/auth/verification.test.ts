import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activeSessionUserId: vi.fn(),
  userLean: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({ activeSessionUserId: mocks.activeSessionUserId }));
vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/models/User", () => ({
  User: {
    findById: () => ({ select: () => ({ lean: mocks.userLean }) }),
  },
}));

import { emailVerificationEnforced, verifiedSession } from "./verification";

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_FROM_EMAIL", "");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("email verification gate", () => {
  it("is disabled unless both Resend variables are configured", () => {
    expect(emailVerificationEnforced()).toBe(false);
    vi.stubEnv("RESEND_API_KEY", "key");
    expect(emailVerificationEnforced()).toBe(false);
    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
    expect(emailVerificationEnforced()).toBe(true);
  });

  it("does not block writes when no mail provider is configured", async () => {
    mocks.activeSessionUserId.mockResolvedValue("user-1");

    await expect(verifiedSession()).resolves.toEqual({ uid: "user-1", emailVerified: true });
    expect(mocks.userLean).not.toHaveBeenCalled();
  });

  it("reports the real verification state when enforcement is on", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
    mocks.activeSessionUserId.mockResolvedValue("user-1");
    mocks.userLean.mockResolvedValue({ emailVerified: false });

    await expect(verifiedSession()).resolves.toEqual({ uid: "user-1", emailVerified: false });
  });

  it("returns null when the session user no longer exists", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
    mocks.activeSessionUserId.mockResolvedValue("user-1");
    mocks.userLean.mockResolvedValue(null);

    await expect(verifiedSession()).resolves.toBeNull();
  });
});
