import mongoose, { Schema } from "mongoose";

/**
 * Server-side state for one OAuth connection attempt. The PKCE verifier and the
 * provider state never leave the server: only `state` is public (it travels in the
 * authorization URL), and it is unique per attempt so a callback can be resolved
 * back to its owner.
 */
const OAuthAttemptSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attemptId: { type: String, required: true, unique: true, index: true },
    backend: { type: String, required: true },
    tenantId: { type: String, required: true },
    principalId: { type: String, required: true },
    platforms: { type: [String], required: true },
    capabilities: { type: [String], default: [] },
    redirectUri: { type: String, required: true },
    state: { type: String, required: true, unique: true, index: true },
    codeVerifier: { type: String, required: true },
    providerState: { type: String },
    status: { type: String, enum: ["pending", "discovered", "consumed"], default: "pending", index: true },
    discoveryClaimed: { type: Boolean, default: false },
    discovered: { type: Schema.Types.Mixed },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

OAuthAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthAttempt = mongoose.models.OAuthAttempt ?? mongoose.model("OAuthAttempt", OAuthAttemptSchema);
