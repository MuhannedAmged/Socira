import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY ?? "";
  // Accept base64 or hex or utf8; derive 32 bytes deterministically.
  const buf = Buffer.from(raw, raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw) ? "hex" : "base64");
  if (buf.length === 32) return buf;
  const fallback = Buffer.alloc(32);
  Buffer.from(raw, "utf8").copy(fallback);
  return fallback;
}

export function keyVersion(): number {
  return Number(process.env.CREDENTIAL_ENCRYPTION_KEY_VERSION ?? "1");
}

export function encryptToken(plaintext: string): { ciphertext: string; iv: string; tag: string; version: number } {
  if (!process.env.CREDENTIAL_ENCRYPTION_KEY) throw new Error("CREDENTIAL_ENCRYPTION_KEY is not configured.");
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
