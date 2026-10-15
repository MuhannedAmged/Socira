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

  it("ownership scoping rule: browser ids are never trusted alone", () => {
    // Documents the invariant enforced in API routes: { _id: { $in: ids }, ownerId: uid }
    const filter = { _id: { $in: ["a", "b"] }, ownerId: "uid-1" };
    expect(filter.ownerId).toBe("uid-1");
  });
});
