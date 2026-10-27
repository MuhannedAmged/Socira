import { describe, expect, it } from "vitest";
import { isCurrentSessionVersion } from "./session";

describe("session version revocation", () => {
  it("accepts a token issued at the current version", () => {
    expect(isCurrentSessionVersion(0, 0)).toBe(true);
    expect(isCurrentSessionVersion(3, 3)).toBe(true);
  });

  it("treats a token without a version claim as version 0", () => {
    expect(isCurrentSessionVersion(undefined, 0)).toBe(true);
    expect(isCurrentSessionVersion(undefined, 1)).toBe(false);
  });

  it("rejects every token issued before a password reset bumped the version", () => {
    expect(isCurrentSessionVersion(0, 1)).toBe(false);
    expect(isCurrentSessionVersion(2, 3)).toBe(false);
  });

  it("does not let a malformed claim bypass the check", () => {
    expect(isCurrentSessionVersion("1", 1)).toBe(false);
    expect(isCurrentSessionVersion(1.5, 1)).toBe(false);
  });
});
