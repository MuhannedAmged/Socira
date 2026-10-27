import { describe, expect, it } from "vitest";
import { configuredAppOrigin } from "./origin";

describe("configured app origin", () => {
  it("returns the configured origin and ignores any path or trailing slash", () => {
    expect(
      configuredAppOrigin({ NODE_ENV: "test", NEXT_PUBLIC_APP_URL: "https://socira.example/app/" }),
    ).toBe("https://socira.example");
  });

  it("returns null when the origin is absent — callers must not fall back to Host", () => {
    expect(configuredAppOrigin({ NODE_ENV: "test" })).toBeNull();
    expect(configuredAppOrigin({ NODE_ENV: "test", NEXT_PUBLIC_APP_URL: "   " })).toBeNull();
  });

  it("rejects malformed values", () => {
    expect(configuredAppOrigin({ NODE_ENV: "test", NEXT_PUBLIC_APP_URL: "not a url" })).toBeNull();
  });

  it("allows HTTP only outside production", () => {
    expect(
      configuredAppOrigin({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "http://localhost:3000" }),
    ).toBe("http://localhost:3000");
    expect(
      configuredAppOrigin({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "http://localhost:3000" }),
    ).toBeNull();
  });

  it("accepts an HTTPS production origin", () => {
    expect(
      configuredAppOrigin({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "https://socira.example" }),
    ).toBe("https://socira.example");
  });
});
