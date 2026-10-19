import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db/mongoose";
import { Post, PostDestination } from "@/models/Post";
import { SocialAccount } from "@/models/SocialAccount";
import { activeSessionUserId } from "@/lib/auth/session";

export const runtime = "nodejs";

const createSchema = z.object({
  content: z.string().min(1).max(63206),
  accountIds: z.array(z.string()).min(1).max(6),
  status: z.enum(["draft", "publishing", "planned"]).default("draft"),
});

export async function GET() {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();
  const posts = await Post.find({ ownerId: uid }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid post." }, { status: 400 });
  }
  await dbConnect();
  // Reject non-ObjectId references with a 400 — never let Mongoose throw a CastError 500.
  const ids = parsed.data.accountIds.filter((id) => mongoose.isValidObjectId(id));
  if (ids.length !== parsed.data.accountIds.length) {
    return NextResponse.json(
      { error: "Select destinations from your connected accounts list." },
      { status: 400 },
    );
  }
  // Ownership check: every destination must belong to the caller.
  const accounts = await SocialAccount.find({ _id: { $in: ids }, ownerId: uid }).lean();
  if (accounts.length !== parsed.data.accountIds.length) {
    return NextResponse.json({ error: "One or more accounts do not belong to you." }, { status: 403 });
  }
  const idempotencyKey = createHash("sha256")
    .update(`${uid}:${parsed.data.content}:${[...parsed.data.accountIds].sort().join(",")}:${randomBytes(8).toString("hex")}`)
    .digest("hex");
  const post = await Post.create({
    ownerId: uid,
    content: parsed.data.content,
    status: parsed.data.status === "publishing" ? "publishing" : parsed.data.status,
    idempotencyKey,
  });
  // Record per-destination outcomes honestly: queued for real publish worker, not fake success.
  const destinations = await PostDestination.insertMany(
    accounts.map((a) => ({
      ownerId: uid,
      postId: post._id,
      socialAccountId: a._id,
      platform: a.platform,
      status: parsed.data.status === "draft" || parsed.data.status === "planned" ? "queued" : "publishing",
    })),
  );
  return NextResponse.json({ ok: true, postId: String(post._id), destinations: destinations.length });
}
