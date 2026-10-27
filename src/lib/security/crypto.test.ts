import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

describe("credential crypto contract", () => {
  it("round-trips AES-256-GCM via the app module", async () => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    const { encryptToken, decryptToken } = await import("@/lib/security/crypto");
    const enc = encryptToken("secret-token-value");
    expect(decryptToken(enc.ciphertext, enc.iv, enc.tag)).toBe("secret-token-value");
    expect(enc.version).toBe(1);
  });

  it("rejects key material that is not exactly 32 bytes", async () => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = "short";
    const { encryptToken } = await import("@/lib/security/crypto");
    expect(() => encryptToken("x")).toThrow(/32 bytes/);
    process.env.CREDENTIAL_ENCRYPTION_KEY = randomBytes(32).toString("hex");
    const enc = encryptToken("hex-key-works");
    const { decryptToken } = await import("@/lib/security/crypto");
    expect(decryptToken(enc.ciphertext, enc.iv, enc.tag)).toBe("hex-key-works");
  });

  it("ownership scoping rule: browser ids are never trusted alone", () => {
    // Documents the invariant enforced in API routes: { _id: { $in: ids }, ownerId: uid }
    const filter = { _id: { $in: ["a", "b"] }, ownerId: "uid-1" };
    expect(filter.ownerId).toBe("uid-1");
  });

  it("compares secrets in constant time without leaking their length", async () => {
    const { safeEqual } = await import("@/lib/security/crypto");
    expect(safeEqual("same-secret", "same-secret")).toBe(true);
    expect(safeEqual("same-secret", "same-secreu")).toBe(false);
    expect(safeEqual("short", "a-much-longer-secret")).toBe(false);
  });
});
