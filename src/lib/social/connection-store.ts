import type {
  ConnectionAccount,
  ConnectionAttempt,
  ConnectionGrant,
  ConnectionStore,
} from "@opencoredev/social-sdk/server";
import { OAuthAttempt } from "@/models/OAuthAttempt";

export const OAUTH_BACKEND = "direct";

interface AttemptDoc {
  attemptId: string;
  backend: string;
  tenantId: string;
  principalId: string;
  platforms: string[];
  capabilities: string[];
  redirectUri: string;
  state: string;
  codeVerifier: string;
  providerState?: string | null;
  discovered?: unknown;
  createdAt: Date;
  expiresAt: Date;
}

function project(doc: AttemptDoc): ConnectionAttempt {
  return {
    id: doc.attemptId,
    backend: doc.backend,
    tenantId: doc.tenantId,
    principalId: doc.principalId,
    platforms: doc.platforms,
    capabilities: doc.capabilities ?? [],
    redirectUri: doc.redirectUri,
    state: doc.state,
    codeVerifier: doc.codeVerifier,
    ...(doc.providerState ? { providerState: doc.providerState } : {}),
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString(),
  };
}

/**
 * MongoDB-backed ConnectionStore for the Social SDK.
 *
 * The SDK owns state/PKCE generation and its own constant-time comparison; this store
 * only has to persist the attempt, claim the one-use code exchange atomically, and
 * consume the attempt when grants are issued. Credentials are written by the OAuth
 * credential sink, which the provider calls during discovery.
 */
export class MongoConnectionStore implements ConnectionStore {
  async save(attempt: ConnectionAttempt): Promise<void> {
    await OAuthAttempt.create({
      ownerId: attempt.principalId,
      attemptId: attempt.id,
      backend: attempt.backend,
      tenantId: attempt.tenantId,
      principalId: attempt.principalId,
      platforms: [...attempt.platforms],
      capabilities: [...attempt.capabilities],
      redirectUri: attempt.redirectUri,
      state: attempt.state,
      codeVerifier: attempt.codeVerifier,
      providerState: attempt.providerState,
      status: "pending",
      expiresAt: new Date(attempt.expiresAt),
    });
  }

  async get(attemptId: string): Promise<ConnectionAttempt | undefined> {
    const doc = (await OAuthAttempt.findOne({
      attemptId,
      status: { $ne: "consumed" },
    }).lean()) as unknown as AttemptDoc | null;
    return doc ? project(doc) : undefined;
  }

  async claimDiscovery(attemptId: string): Promise<boolean> {
    const claimed = await OAuthAttempt.findOneAndUpdate(
      { attemptId, consumedAt: null, discoveryClaimed: false },
      { $set: { discoveryClaimed: true } },
    ).lean();
    return claimed !== null;
  }

  async saveDiscoveredAccounts(attemptId: string, accounts: readonly ConnectionAccount[]): Promise<void> {
    const result = await OAuthAttempt.updateOne(
      { attemptId, discoveryClaimed: true, consumedAt: null },
      {
        $set: {
          discovered: accounts.map((account) => ({ ref: account.ref, displayName: account.displayName })),
          status: "discovered",
        },
      },
    );
    if (result.matchedCount === 0) {
      throw new Error("Discovery result could not be persisted for this OAuth attempt.");
    }
  }

  async getDiscoveredAccounts(attemptId: string): Promise<readonly ConnectionAccount[] | undefined> {
    const doc = (await OAuthAttempt.findOne({ attemptId, consumedAt: null }).lean()) as unknown as AttemptDoc | null;
    if (!doc || !Array.isArray(doc.discovered) || doc.discovered.length === 0) return undefined;
    return doc.discovered as ConnectionAccount[];
  }

  async complete(input: {
    attemptId: string;
    state: string;
    accounts: readonly ConnectionAccount[];
    selectedAccountIds: readonly string[];
  }): Promise<readonly ConnectionGrant[]> {
    const doc = (await OAuthAttempt.findOneAndUpdate(
      { attemptId: input.attemptId, state: input.state, consumedAt: null },
      { $set: { consumedAt: new Date(), status: "consumed" } },
    ).lean()) as unknown as AttemptDoc | null;
    if (!doc) throw new Error("Connection callback is invalid or was already consumed.");
    if (!Array.isArray(doc.discovered) || JSON.stringify(doc.discovered) !== JSON.stringify(input.accounts)) {
      throw new Error("Grants must match the persisted discovery result.");
    }
    const selected = new Set(input.selectedAccountIds);
    return input.accounts
      .filter((account) => selected.has(account.ref.accountId))
      .map((account) => ({
        grantId: `${input.attemptId}:${account.ref.accountId}`,
        tenantId: doc.tenantId,
        principalId: doc.principalId,
        account: account.ref,
        capabilities: doc.capabilities ?? [],
      }));
  }
}
