import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // Never returned unless a query opts in with .select("+passwordHash").
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    timezone: { type: String, default: "UTC" },
    preferences: {
      emailOnPublish: { type: Boolean, default: true },
      emailOnFailure: { type: Boolean, default: true },
    },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.models.User ?? mongoose.model("User", UserSchema);
