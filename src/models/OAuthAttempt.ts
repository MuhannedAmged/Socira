import mongoose, { Schema } from "mongoose";

const OAuthAttemptSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    platform: { type: String, required: true },
    attemptId: { type: String, required: true, unique: true, index: true },
    stateHash: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "consumed", "expired"], default: "pending", index: true },
    discovered: { type: Schema.Types.Mixed, default: [] },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

export const OAuthAttempt = mongoose.models.OAuthAttempt ?? mongoose.model("OAuthAttempt", OAuthAttemptSchema);
