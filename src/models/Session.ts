import mongoose, { Schema } from "mongoose";

/**
 * Per-token logout denylist. Entries are keyed by the JWT `jti` claim and expire with the token,
 * so the collection stays bounded (Mongo's TTL monitor removes them). Password-reset revocation
 * still uses `User.sessionVersion`, which invalidates every token at once.
 */
const RevokedSessionSchema = new Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

RevokedSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedSession =
  mongoose.models.RevokedSession ?? mongoose.model("RevokedSession", RevokedSessionSchema);
