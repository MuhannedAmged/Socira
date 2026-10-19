import { afterEach, describe, expect, it, vi } from "vitest";
import { buildProvider, missingOAuthEnv, oauthRedirectUri, platformSupport } from "./oauth";

const REDIRECT = "http://localhost:3000/api/social/callback";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("platformSupport", () => {
  it("reports Facebook as unsupported instead of pretending a redirect exists", () => {
    const support = platformSupport("facebook");
    expect(support.ok).toBe(false);
    if (!support.ok) expect(support.error).toMatch(/no Facebook OAuth provider/i);
  });

  it("names every missing environment variable", () => {
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_SECRET", "");
    expect(missingOAuthEnv("youtube")).toEqual(["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"]);
    const support = platformSupport("youtube");
    expect(support.ok).toBe(false);
    if (!support.ok) expect(support.missing).toContain("GOOGLE_OAUTH_CLIENT_ID");
  });

  it("requires an explicit LinkedIn API version", () => {
    vi.stubEnv("LINKEDIN_CLIENT_ID", "id");
    vi.stubEnv("LINKEDIN_CLIENT_SECRET", "secret");
    vi.stubEnv("LINKEDIN_API_VERSION", "");
    expect(platformSupport("linkedin").ok).toBe(false);
    expect(missingOAuthEnv("linkedin")).toContain("LINKEDIN_API_VERSION");
  });

  it("rejects a malformed LinkedIn API version", () => {
    vi.stubEnv("LINKEDIN_CLIENT_ID", "id");
    vi.stubEnv("LINKEDIN_CLIENT_SECRET", "secret");
    vi.stubEnv("LINKEDIN_API_VERSION", "v2");
    const support = platformSupport("linkedin");
    expect(support.ok).toBe(false);
    if (!support.ok) expect(support.error).toMatch(/YYYYMM/);
  });
});

describe("provider authorization URL", () => {
  it("builds a YouTube consent URL carrying client, redirect and state", async () => {
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "google-client");
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_SECRET", "google-secret");
    const support = platformSupport("youtube");
    expect(support.ok).toBe(true);
    if (!support.ok) return;

    const { authorizationUrl } = await buildProvider(support.config).start({
      platforms: ["youtube"],
      capabilities: [],
      redirectUri: REDIRECT,
      state: "state-value",
      codeChallenge: "challenge-value",
    });

    const url = new URL(authorizationUrl);
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("google-client");
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT);
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("code_challenge")).toBeNull();
  });

  it("adds a PKCE S256 challenge for X", async () => {
    vi.stubEnv("X_CLIENT_ID", "x-client");
    vi.stubEnv("X_CLIENT_SECRET", "x-secret");
    const support = platformSupport("x");
    expect(support.ok).toBe(true);
    if (!support.ok) return;

    const { authorizationUrl } = await buildProvider(support.config).start({
      platforms: ["x"],
      capabilities: [],
      redirectUri: REDIRECT,
      state: "state-value",
      codeChallenge: "challenge-value",
    });

    const url = new URL(authorizationUrl);
    expect(url.searchParams.get("code_challenge")).toBe("challenge-value");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });
});

describe("oauthRedirectUri", () => {
  it("derives the callback from the configured app URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://socira.example");
    expect(oauthRedirectUri()).toBe("https://socira.example/api/social/callback");
  });

  it("returns undefined when the app URL is absent", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(oauthRedirectUri()).toBeUndefined();
  });
});
