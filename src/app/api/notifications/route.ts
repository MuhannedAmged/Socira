import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Notification } from "@/models/library";
import { activeSessionUserId } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit/memory";
import { crossOriginBlock, rateKey } from "@/lib/http/request";

export const runtime = "nodejs";

export async function GET() {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();
  const items = await Notification.find({ ownerId: uid }).sort({ createdAt: -1 }).limit(30).lean();
  const unread = await Notification.countDocuments({ ownerId: uid, read: false });
  return NextResponse.json({ items, unread });
}

export async function PATCH(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!rateLimit(rateKey("notifications:read", req, uid), 60, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
  await dbConnect();
  await Notification.updateMany({ ownerId: uid, read: false }, { $set: { read: true } });
  return NextResponse.json({ ok: true });
}
