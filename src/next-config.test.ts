import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("response security headers", () => {
  it("marks every API response as non-cacheable", async () => {
    const rules = await nextConfig.headers?.();
    const api = rules?.find((rule) => rule.source === "/api/:path*");
    expect(api).toBeDefined();
    const cache = api?.headers.find((header) => header.key.toLowerCase() === "cache-control");
    expect(cache?.value).toContain("no-store");
    expect(cache?.value).toContain("no-cache");
  });

  it("does not emit a static CSP that would conflict with the per-request nonce policy", async () => {
    const rules = await nextConfig.headers?.();
    const global = rules?.find((rule) => rule.source === "/:path*");
    expect(global).toBeDefined();
    const csp = global?.headers.find((header) => header.key.toLowerCase() === "content-security-policy");
    expect(csp).toBeUndefined();
  });

  it("keeps the other baseline security headers", async () => {
    const rules = await nextConfig.headers?.();
    const global = rules?.find((rule) => rule.source === "/:path*");
    const keys = new Set(global?.headers.map((header) => header.key.toLowerCase()));

    expect(keys.has("x-content-type-options")).toBe(true);
    expect(keys.has("x-frame-options")).toBe(true);
    expect(keys.has("referrer-policy")).toBe(true);
    expect(keys.has("permissions-policy")).toBe(true);
  });
});
