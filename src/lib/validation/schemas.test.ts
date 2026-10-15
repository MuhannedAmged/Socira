import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, verifySchema } from "@/lib/validation/schemas";

describe("auth validation", () => {
  it("rejects mismatched passwords", () => {
    const r = registerSchema.safeParse({
      name: "Ada", email: "ADA@Example.com", password: "0123456789", confirm: "different", accept: true,
    });
    expect(r.success).toBe(false);
  });

  it("normalizes email on login", () => {
    const r = loginSchema.safeParse({ email: "  Ada@Example.com ", password: "x" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("ada@example.com");
  });

  it("enforces 6-digit codes", () => {
    expect(verifySchema.safeParse({ email: "a@b.co", code: "12345" }).success).toBe(false);
    expect(verifySchema.safeParse({ email: "a@b.co", code: "123456" }).success).toBe(true);
  });
});
