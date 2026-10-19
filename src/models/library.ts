import mongoose, { Schema } from "mongoose";
import { mediaExpiresAt } from "@/lib/media/retention";

const MediaAssetSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storagePath: { type: String, required: true },
    bucket: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    durationSec: { type: Number },
    status: { type: String, enum: ["uploading", "ready", "failed"], default: "ready", index: true },
    expiresAt: { type: Date, required: true, index: true, default: () => mediaExpiresAt() },
  },
  { timestamps: true },
);

MediaAssetSchema.index({ ownerId: 1, createdAt: -1 });

export const MediaAsset = mongoose.models.MediaAsset ?? mongoose.model("MediaAsset", MediaAssetSchema);

const NotificationSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    resourceKind: { type: String, default: "" },
    resourceId: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ ownerId: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification ?? mongoose.model("Notification", NotificationSchema);

const EmailVerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, default: "email_verify" },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
  },
  { timestamps: true },
);

export const EmailVerification =
  mongoose.models.EmailVerification ?? mongoose.model("EmailVerification", EmailVerificationSchema);

const PasswordResetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date },
  },
  { timestamps: true },
);

export const PasswordReset = mongoose.models.PasswordReset ?? mongoose.model("PasswordReset", PasswordResetSchema);

const AuditLogSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    event: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditLog = mongoose.models.AuditLog ?? mongoose.model("AuditLog", AuditLogSchema);
