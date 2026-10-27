import { z } from "zod";

const emailField = (message = "Enter a valid email address") =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email(message),
  );

/**
 * bcrypt only considers the first 72 bytes of a password. Rejecting longer inputs at the boundary
 * prevents two visually different passwords from authenticating the same account.
 */
const MAX_PASSWORD_BYTES = 72;
const passwordBytes = (value: string) => new TextEncoder().encode(value).length;
const bcryptSafePassword = (schema: z.ZodString) =>
  schema.refine((value) => passwordBytes(value) <= MAX_PASSWORD_BYTES, {
    message: `Password must be at most ${MAX_PASSWORD_BYTES} bytes (use fewer characters or symbols).`,
  });

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: emailField(),
  password: bcryptSafePassword(z.string().min(10, "Password must be at least 10 characters").max(128)),
  confirm: z.string(),
  accept: z.literal(true, { message: "Please accept the privacy policy and terms" }),
}).refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const loginSchema = z.object({
  email: emailField(),
  password: z.string().min(1, "Password is required"),
});

export const verifySchema = z.object({
  email: emailField(),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const forgotSchema = z.object({
  email: emailField(),
});

export const resetSchema = z.object({
  token: z.string().min(16).max(256),
  password: bcryptSafePassword(z.string().min(10).max(128)),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const composeSchema = z.object({
  content: z.string().min(1, "Write something first").max(63206),
  accountIds: z.array(z.string()).min(1, "Select at least one account"),
  scheduledAt: z.string().optional(),
});

/* ——— Client form schemas (plain strings; normalize email in onSubmit) ——— */

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Enter a valid email address"),
    password: bcryptSafePassword(z.string().min(10, "Password must be at least 10 characters").max(128)),
    confirm: z.string(),
    accept: z.boolean().refine((v) => v === true, { message: "Please accept the privacy policy and terms" }),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const verifyFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const forgotFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type RegisterInput = { name: string; email: string; password: string; confirm: string; accept: boolean };
export type LoginInput = { email: string; password: string };
