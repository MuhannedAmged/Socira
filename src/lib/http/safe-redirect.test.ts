import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./safe-redirect";

const ORIGIN = "https://socira.example";

describe("post-login redirect", () => {
  it("keeps an ordinary relative destination", () => {
    expect(safeInternalPath("/compose", ORIGIN)).toBe("/compose");
    expect(safeInternalPath("/posts?status=draft#top", ORIGIN)).toBe("/posts?status=draft#top");
  });

  it("falls back when no destination was provided", () => {
    expect(safeInternalPath(null, ORIGIN)).toBe("/dashboard");
    expect(safeInternalPath("", ORIGIN)).toBe("/dashboard");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeInternalPath("https://evil.example", ORIGIN)).toBe("/dashboard");
    expect(safeInternalPath("//evil.example", ORIGIN)).toBe("/dashboard");
    expect(safeInternalPath("javascript:alert(1)", ORIGIN)).toBe("/dashboard");
  });

  it("rejects the backslash form browsers normalize to another origin", () => {
    expect(safeInternalPath("/\\evil.example", ORIGIN)).toBe("/dashboard");
    expect(safeInternalPath("\\\\evil.example", ORIGIN)).toBe("/dashboard");
  });

  it("rejects malformed input without throwing", () => {
    expect(safeInternalPath("http://[", ORIGIN)).toBe("/dashboard");
  });
});
