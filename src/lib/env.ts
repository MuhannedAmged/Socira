/* Server-side environment validation. Never import client-side secrets here into browser code. */

function required(name: string): string | undefined {
  return process.env[name];
}

export function envStatus() {
  return {
    mongodb: Boolean(required("MONGODB_URI")),
    resend: Boolean(required("RESEND_API_KEY") && required("RESEND_FROM_EMAIL")),
    supabase: Boolean(required("SUPABASE_URL") && required("SUPABASE_SERVICE_ROLE_KEY")),
    auth: Boolean(required("AUTH_SECRET")),
    encryption: Boolean(required("CREDENTIAL_ENCRYPTION_KEY")),
  };
}

export function assertServerEnv(names: string[]) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}. See .env.example.`);
  }
}
