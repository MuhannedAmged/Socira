import mongoose, { Schema } from "mongoose";

const SocialAccountSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    platform: { type: String, enum: ["instagram", "facebook", "youtube", "linkedin", "tiktok", "x"], required: true, index: true },
    backend: { type: String, default: "direct" },
    providerAccountId: { type: String, required: true },
    displayName: { type: String, default: "" },
    handle: { type: String, default: "" },
    profileImageUrl: { type: String, default: "" },
    scopes: { type: [String], default: [] },
    status: { type: String, enum: ["connected", "reconnect_required", "disconnected"], default: "connected", index: true },
    tokenRevision: { type: Number, default: 1 },
    lastSyncAt: { type: Date },
  },
  { timestamps: true },
);

SocialAccountSchema.index({ ownerId: 1, platform: 1, providerAccountId: 1 }, { unique: true });

export const SocialAccount = mongoose.models.SocialAccount ?? mongoose.model("SocialAccount", SocialAccountSchema);
