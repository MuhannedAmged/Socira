import {
  ConnectionManager,
  oauthProvider,
  type ConnectionProvider,
  type OAuthCredentialSink,
  type OAuthProviderOptions,
} from "@opencoredev/social-sdk/server";
import { SocialAccount } from "@/models/SocialAccount";
import { Credential } from "@/models/Credential";
import { encryptToken } from "@/lib/security/crypto";
import { MongoConnectionStore } from "@/lib/social/connection-store";

/**
 * Provider kinds the installed Social SDK can authorize.
 *
 * `facebook` is deliberately absent: @opencoredev/social-sdk@0.5.0 ships a Facebook
 * platform adapter but no OAuth provider for it, so a Facebook connection cannot be
 * completed by this app. It is reported as unsupported rather than faked.
 */
export type ProviderKind = "youtube" | "x" | "tiktok" | "instagram" | "linkedin";

interface ProviderConfig {
  kind: ProviderKind;
  label: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  extraEnv: readonly string[];
}

export const PROVIDER_CONFIG: Readonly<Record<string, ProviderConfig>> = {
  instagram: {
    kind: "instagram",
    label: "Instagram",
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    extraEnv: [],
  },
  youtube: {
    kind: "youtube",
    label: "YouTube",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraEnv: [],
  },
  linkedin: {
    kind: "linkedin",
    label: "LinkedIn",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    extraEnv: ["LINKEDIN_API_VERSION"],
  },
  tiktok: {
    kind: "tiktok",
    label: "TikTok",
    clientIdEnv: "TIKTOK_CLIENT_KEY",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
    extraEnv: [],
  },
  x: {
    kind: "x",
    label: "X",
    clientIdEnv: "X_CLIENT_ID",
    clientSecretEnv: "X_CLIENT_SECRET",
    extraEnv: [],
  },
};

const UNSUPPORTED: Readonly<Record<string, string>> = {
  facebook: "The installed Social SDK has no Facebook OAuth provider, so Facebook cannot be connected here.",
};

/** Env variables that must be present before a platform can be connected. */
export function missingOAuthEnv(platform: string): string[] {
  const config = PROVIDER_CONFIG[platform];
  if (!config) return [];
  const names = [config.clientIdEnv, config.clientSecretEnv, ...config.extraEnv];
  return names.filter((name) => !(process.env[name] ?? "").trim());
}

export type PlatformSupport =
  | { ok: true; config: ProviderConfig }
  | { ok: false; error: string; missing?: string[] };

export function platformSupport(platform: string): PlatformSupport {
  if (UNSUPPORTED[platform]) return { ok: false, error: UNSUPPORTED[platform] };
  const config = PROVIDER_CONFIG[platform];
  if (!config) return { ok: false, error: `Unknown platform: ${platform}.` };
  const missing = missingOAuthEnv(platform);
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      error: `OAuth is not configured for ${platform}. Missing: ${missing.join(", ")}. See .env.example.`,
    };
  }
  if (config.kind === "linkedin") {
    const version = (process.env.LINKEDIN_API_VERSION ?? "").trim();
    if (!/^20\d{2}(0[1-9]|1[0-2])$/.test(version)) {
      return {
        ok: false,
        error: "LINKEDIN_API_VERSION must be an explicit Marketing API version in YYYYMM form (for example 202601).",
      };
    }
  }
  return { ok: true, config };
}

/** Resolve the registered callback URL. It must match what the platform console holds. */
export function oauthRedirectUri(): string | undefined {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
  if (!base) return undefined;
  try {
    return new URL("/api/social/callback", base).toString();
  } catch {
    return undefined;
  }
}

/**
 * Persists a provider-issued token. Called by the SDK inside the provider's code
 * exchange, before accounts are presented, so the same upsert is safe to repeat.
 */
export const credentialSink: OAuthCredentialSink = {
  async save({ account, token, attempt }) {
    const ownerId = attempt.principalId;
    const scopes = token.scopes ? [...token.scopes] : [];
    const social = await SocialAccount.findOneAndUpdate(
      { ownerId, platform: account.ref.platform, providerAccountId: account.ref.accountId },
      {
        $set: {
          backend: account.ref.backend,
          displayName: account.displayName,
          scopes,
          status: "connected",
          lastSyncAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const access = encryptToken(token.accessToken);
    const refresh = token.refreshToken ? encryptToken(token.refreshToken) : null;
    await Credential.findOneAndUpdate(
      { ownerId, socialAccountId: social._id },
      {
        $set: {
          accessCipher: access.ciphertext,
          accessIv: access.iv,
          accessTag: access.tag,
          refreshCipher: refresh?.ciphertext ?? "",
          refreshIv: refresh?.iv ?? "",
          refreshTag: refresh?.tag ?? "",
          keyVersion: access.version,
          expiresAt: token.expiresAt ? new Date(token.expiresAt) : undefined,
          scopes,
        },
        $inc: { tokenRevision: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  },
};

/** Builds the SDK provider for a platform whose configuration is present. */
export function buildProvider(config: ProviderConfig, sink?: OAuthCredentialSink): ConnectionProvider {
  const options: OAuthProviderOptions = {
    clientId: (process.env[config.clientIdEnv] ?? "").trim(),
    clientSecret: (process.env[config.clientSecretEnv] ?? "").trim(),
    ...(sink ? { credentialSink: sink } : {}),
    ...(config.kind === "linkedin" ? { linkedinApiVersion: (process.env.LINKEDIN_API_VERSION ?? "").trim() } : {}),
  };
  return oauthProvider(config.kind, options);
}

export function newConnectionManager(): ConnectionManager {
  return new ConnectionManager({ store: new MongoConnectionStore() });
}

/** Extract a stable error code from a thrown SocialError, without importing its shape. */
export function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return "oauth_failed";
}
