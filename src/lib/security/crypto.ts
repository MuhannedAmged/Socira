import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";

const ALGO = "aes-256-gcm";
const KEY_BYTES = 32;

/**
 * Parse CREDENTIAL_ENCRYPTION_KEY strictly. A key that is not exactly 32 bytes is a
 * configuration error — silently zero-padding a short key would encrypt every token with a
 * predictable, low-entropy key.
 */
function key(): Buffer {
  const raw = (process.env.CREDENTIAL_ENCRYPTION_KEY ?? "").trim();
  if (!raw) throw new Error("CREDENTIAL_ENCRYPTION_KEY is not configured.");
  const hex = raw.length === KEY_BYTES * 2 && /^[0-9a-fA-F]+$/.test(raw);
  const buf = Buffer.from(raw, hex ? "hex" : "base64");
  if (buf.length !== KEY_BYTES) {
    throw new Error(
      `CREDENTIAL_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes (44-char base64 or 64-char hex). Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
    );
  }
  return buf;
}

export function keyVersion(): number {
  return Number(process.env.CREDENTIAL_ENCRYPTION_KEY_VERSION ?? "1");
}

export function encryptToken(plaintext: string): { ciphertext: string; iv: string; tag: string; version: number } {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { ciphertext: enc.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), version: keyVersion() };
}

export function decryptToken(ciphertext: string, iv: string, tag: string): string {
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const dec = Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]);
  return dec.toString("utf8");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
