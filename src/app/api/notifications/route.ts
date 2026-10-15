import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { Notification } from "@/models/library";
import { sessionUserId } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();
  const items = await Notification.find({ ownerId: uid }).sort({ createdAt: -1 }).limit(30).lean();
  const unread = await Notification.countDocuments({ ownerId: uid, read: false });
  return NextResponse.json({ items, unread });
}

export async function PATCH() {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();
  await Notification.updateMany({ ownerId: uid, read: false }, { $set: { read: true } });
  return NextResponse.json({ ok: true });
}
