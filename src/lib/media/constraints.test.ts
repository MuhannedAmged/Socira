import { describe, expect, it } from "vitest";
import {
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  maxBytesForMime,
  mediaKind,
  mimeMatches,
  normalizeMime,
} from "./constraints";

describe("upload constraints", () => {
  it("classifies only the supported image and video types", () => {
    expect(mediaKind("image/jpeg")).toBe("image");
    expect(mediaKind("IMAGE/PNG")).toBe("image");
    expect(mediaKind("video/mp4")).toBe("video");
    expect(mediaKind("image/svg+xml")).toBeNull();
    expect(mediaKind("application/pdf")).toBeNull();
  });

  it("strips MIME parameters before matching", () => {
    expect(normalizeMime("image/jpeg; charset=binary")).toBe("image/jpeg");
    expect(mediaKind("video/webm; codecs=vp9")).toBe("video");
  });

  it("applies the per-type size caps", () => {
    expect(maxBytesForMime("image/webp")).toBe(IMAGE_MAX_BYTES);
    expect(maxBytesForMime("video/quicktime")).toBe(VIDEO_MAX_BYTES);
    expect(maxBytesForMime("application/zip")).toBeNull();
  });

  it("treats only the JPEG/JPG alias as equivalent", () => {
    expect(mimeMatches("image/jpeg", "image/jpeg")).toBe(true);
    expect(mimeMatches("image/jpeg", "image/jpg")).toBe(true);
    expect(mimeMatches("image/png", "image/jpeg")).toBe(false);
    expect(mimeMatches("image/gif", "text/html")).toBe(false);
  });
});
