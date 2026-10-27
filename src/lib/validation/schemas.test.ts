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

  it("rejects passwords that bcrypt would silently truncate past 72 bytes", () => {
    const long = "a".repeat(73);
    expect(
      registerSchema.safeParse({
        name: "Ada", email: "ada@example.com", password: long, confirm: long, accept: true,
      }).success,
    ).toBe(false);

    const multibyte = "é".repeat(37); // 74 UTF-8 bytes, only 37 characters
    expect(
      registerSchema.safeParse({
        name: "Ada", email: "ada@example.com", password: multibyte, confirm: multibyte, accept: true,
      }).success,
    ).toBe(false);

    const exactly72 = "a".repeat(72);
    expect(
      registerSchema.safeParse({
        name: "Ada", email: "ada@example.com", password: exactly72, confirm: exactly72, accept: true,
      }).success,
    ).toBe(true);
  });
});
