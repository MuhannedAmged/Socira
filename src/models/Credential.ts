import mongoose, { Schema } from "mongoose";

const CredentialSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    socialAccountId: { type: Schema.Types.ObjectId, ref: "SocialAccount", required: true, index: true },
    accessCipher: { type: String, required: true },
    accessIv: { type: String, required: true },
    accessTag: { type: String, required: true },
    refreshCipher: { type: String, default: "" },
    refreshIv: { type: String, default: "" },
    refreshTag: { type: String, default: "" },
    keyVersion: { type: Number, required: true },
    expiresAt: { type: Date },
    scopes: { type: [String], default: [] },
    tokenRevision: { type: Number, default: 1 },
  },
  { timestamps: true },
);

CredentialSchema.index({ ownerId: 1, socialAccountId: 1 }, { unique: true });

export const Credential = mongoose.models.Credential ?? mongoose.model("Credential", CredentialSchema);
