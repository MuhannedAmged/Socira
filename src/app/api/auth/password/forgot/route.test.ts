import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  createReset: vi.fn(),
  sendReset: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn(async () => {}) }));
vi.mock("@/models/User", () => ({ User: { findOne: mocks.findUser } }));
vi.mock("@/models/library", () => ({ PasswordReset: { create: mocks.createReset } }));
vi.mock("@/lib/email/resend", () => ({ sendPasswordResetEmail: mocks.sendReset }));
vi.mock("@/lib/rate-limit/memory", () => ({ rateLimit: () => ({ ok: true, remaining: 99 }) }));

import { POST } from "./route";

function request(host = "attacker.example") {
  return new Request(`https://${host}/api/auth/password/forgot`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "victim@example.com" }),
  });
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("password reset link origin", () => {
  it("uses the configured origin, never the request Host", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://socira.example");
    mocks.findUser.mockResolvedValue({ _id: "user-1", email: "victim@example.com" });
    mocks.createReset.mockResolvedValue({});
    mocks.sendReset.mockResolvedValue({ skipped: false });

    const response = await POST(request("attacker.example"));
    expect(response.status).toBe(200);

    const [, url] = mocks.sendReset.mock.calls[0];
    expect(url.startsWith("https://socira.example/reset-password?token=")).toBe(true);
    expect(url).not.toContain("attacker.example");
  });

  it("refuses to send a link when no trusted origin is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    mocks.findUser.mockResolvedValue({ _id: "user-1", email: "victim@example.com" });

    const response = await POST(request("attacker.example"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toMatch(/if an account exists/i);

    expect(mocks.createReset).not.toHaveBeenCalled();
    expect(mocks.sendReset).not.toHaveBeenCalled();
  });
});
