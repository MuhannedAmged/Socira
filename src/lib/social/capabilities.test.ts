import { describe, expect, it } from "vitest";
import { CAPABILITIES, capabilityFor } from "@/lib/social/capabilities";

describe("capability registry", () => {
  it("covers exactly the six supported platforms", () => {
    expect(CAPABILITIES.map((c) => c.platform).sort()).toEqual(
      ["facebook", "instagram", "linkedin", "tiktok", "x", "youtube"],
    );
  });

  it("never reports native scheduling as broadly supported", () => {
    const scheduled = CAPABILITIES.filter((c) => c.nativeScheduling === "supported");
    expect(scheduled.length).toBe(0);
  });

  it("resolves per-platform entries", () => {
    expect(capabilityFor("x")?.platform).toBe("x");
    expect(capabilityFor("unknown")).toBeUndefined();
  });
});
