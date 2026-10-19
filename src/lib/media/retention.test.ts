import { describe, expect, it } from "vitest";
import { MEDIA_RETENTION_DAYS, expiredMediaFilter, liveMediaFilter, mediaExpiresAt } from "./retention";

describe("media retention", () => {
  it("expires an upload three days after it is created", () => {
    const from = new Date("2026-10-19T12:00:00.000Z");
    expect(MEDIA_RETENTION_DAYS).toBe(3);
    expect(mediaExpiresAt(from).toISOString()).toBe("2026-10-22T12:00:00.000Z");
  });

  it("matches assets past expiry and falls back to creation time for legacy rows", () => {
    const now = new Date("2026-10-19T12:00:00.000Z");
    const filter = JSON.stringify(expiredMediaFilter(now));
    expect(filter).toContain(now.toISOString());
    expect(filter).toContain(new Date("2026-10-16T12:00:00.000Z").toISOString());
  });

  it("keeps fresh assets and legacy rows newer than three days", () => {
    const now = new Date("2026-10-19T12:00:00.000Z");
    const filter = JSON.stringify(liveMediaFilter(now));
    expect(filter).toContain(now.toISOString());
    expect(filter).toContain(new Date("2026-10-16T12:00:00.000Z").toISOString());
  });
});
