/**
 * Shared upload constraints. The same allowlist is applied when a signed upload URL is minted
 * (declared metadata) and again when the object is recorded (server-observed metadata).
 */
export const IMAGE_MAX_BYTES = 25 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 512 * 1024 * 1024;

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export type MediaKind = "image" | "video";

/** Lower-cases a MIME value and drops parameters such as `; charset=...`. */
export function normalizeMime(value: string): string {
  return value.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function mediaKind(mime: string): MediaKind | null {
  const normalized = normalizeMime(mime);
  if (IMAGE_MIME.has(normalized)) return "image";
  if (VIDEO_MIME.has(normalized)) return "video";
  return null;
}

export function maxBytesForMime(mime: string): number | null {
  const kind = mediaKind(mime);
  if (kind === "image") return IMAGE_MAX_BYTES;
  if (kind === "video") return VIDEO_MAX_BYTES;
  return null;
}

/**
 * Storage providers occasionally canonicalize JPEG to `image/jpg`. Treat only that pair as
 * equivalent; everything else must match the declared type exactly.
 */
export function mimeMatches(declared: string, observed: string): boolean {
  const a = normalizeMime(declared);
  const b = normalizeMime(observed);
  if (a === b) return true;
  return (
    (a === "image/jpeg" && b === "image/jpg") || (a === "image/jpg" && b === "image/jpeg")
  );
}
