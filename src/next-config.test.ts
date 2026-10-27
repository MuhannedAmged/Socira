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

  it("does not allow arbitrary HTTPS origins in connect-src", async () => {
    const rules = await nextConfig.headers?.();
    const global = rules?.find((rule) => rule.source === "/:path*");
    const csp = global?.headers.find((header) => header.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("connect-src 'self' https:;");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
