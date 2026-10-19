import { describe, expect, it } from "vitest";
import { clientIp, crossOriginBlock, rateKey } from "@/lib/http/request";

function req(headers: Record<string, string>) {
  return new Request("https://app.example.com/api/auth/login", { method: "POST", headers });
}

describe("same-origin guard", () => {
  it("allows a request whose Origin matches the request host", () => {
    expect(crossOriginBlock(req({ origin: "https://app.example.com", host: "app.example.com" }))).toBeNull();
  });

  it("blocks a request whose Origin is another site", () => {
    const blocked = crossOriginBlock(req({ origin: "https://evil.example", host: "app.example.com" }));
    expect(blocked?.status).toBe(403);
  });

  it("blocks a request whose Referer is another site", () => {
    const blocked = crossOriginBlock(req({ referer: "https://evil.example/attack", host: "app.example.com" }));
    expect(blocked?.status).toBe(403);
  });

  it("accepts the configured app origin when NEXT_PUBLIC_APP_URL is set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://socira.example";
    expect(crossOriginBlock(req({ origin: "https://socira.example", host: "internal-host" }))).toBeNull();
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("allows headerless clients (cron, curl) that carry no ambient cookie", () => {
    expect(crossOriginBlock(req({ host: "app.example.com" }))).toBeNull();
  });
});

describe("rate-limit keys", () => {
  it("uses the first forwarded hop, never the whole chain", () => {
    const ip = clientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" }));
    expect(ip).toBe("203.0.113.7");
  });

  it("scopes by identity so one account cannot be brute-forced from many origins", () => {
    const key = rateKey("login:account", req({ "x-forwarded-for": "203.0.113.7" }), "User@Example.com");
    expect(key).toBe("login:account:203.0.113.7:user@example.com");
  });
});
