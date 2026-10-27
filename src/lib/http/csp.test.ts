import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "./csp";

const NONCE = "dGVzdC1ub25jZQ==";

describe("nonce-based content security policy", () => {
  it("puts the nonce in script-src and never allows inline scripts", () => {
    const csp = buildContentSecurityPolicy(NONCE, { isDev: false });

    expect(csp).toContain(`script-src 'self' 'nonce-${NONCE}' 'strict-dynamic'`);
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("keeps unsafe-eval only for development tooling", () => {
    expect(buildContentSecurityPolicy(NONCE, { isDev: true })).toContain("'unsafe-eval'");
  });

  it("limits connect-src to the app and the configured Supabase origin", () => {
    const csp = buildContentSecurityPolicy(NONCE, {
      isDev: false,
      supabaseUrl: "https://project.supabase.co",
    });

    expect(csp).toContain("connect-src 'self' https://project.supabase.co;");
    expect(csp).not.toContain("connect-src 'self' https:;");
  });

  it("does not add Supabase when the URL is absent or malformed", () => {
    expect(buildContentSecurityPolicy(NONCE, { isDev: false, supabaseUrl: "" })).toContain(
      "connect-src 'self';",
    );
    expect(
      buildContentSecurityPolicy(NONCE, { isDev: false, supabaseUrl: "not a url" }),
    ).toContain("connect-src 'self';");
  });

  it("allows inline styles but blocks framing and objects", () => {
    const csp = buildContentSecurityPolicy(NONCE, { isDev: false });

    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });
});
