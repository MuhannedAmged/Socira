import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, maxlength: 63206 },
    status: { type: String, enum: ["draft", "publishing", "published", "failed", "planned"], default: "draft", index: true },
    mediaIds: { type: [Schema.Types.ObjectId], default: [] },
    plannedAt: { type: Date },
    timezone: { type: String, default: "UTC" },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

export const Post = mongoose.models.Post ?? mongoose.model("Post", PostSchema);

const DestinationSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    socialAccountId: { type: Schema.Types.ObjectId, ref: "SocialAccount", required: true },
    platform: { type: String, required: true },
    status: { type: String, enum: ["queued", "publishing", "published", "failed", "unknown", "cancelled"], default: "queued", index: true },
    providerPostId: { type: String, default: "" },
    providerUrl: { type: String, default: "" },
    errorCode: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
    attempts: { type: Number, default: 0 },
    reconciled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PostDestination = mongoose.models.PostDestination ?? mongoose.model("PostDestination", DestinationSchema);
