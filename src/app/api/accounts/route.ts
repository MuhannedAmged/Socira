import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db/mongoose";
import { SocialAccount } from "@/models/SocialAccount";
import { Credential } from "@/models/Credential";
import { AuditLog } from "@/models/library";
import { activeSessionUserId } from "@/lib/auth/session";
import { EMAIL_UNVERIFIED_ERROR, verifiedSession } from "@/lib/auth/verification";
import { crossOriginBlock } from "@/lib/http/request";

export const runtime = "nodejs";

/** GET /api/accounts — the caller's connected accounts (safe fields only, never tokens). */
export async function GET() {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();
  const accounts = await SocialAccount.find({ ownerId: uid }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: String(a._id),
      platform: a.platform,
      displayName: a.displayName,
      handle: a.handle,
      profileImageUrl: a.profileImageUrl,
      status: a.status,
      scopes: a.scopes,
    })),
  });
}

const removeSchema = z.object({ id: z.string().min(1) });

/** DELETE /api/accounts — remove the local connection (ownership-checked). Remote revocation only where supported. */
export async function DELETE(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const session = await verifiedSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!session.emailVerified) {
    return NextResponse.json({ error: EMAIL_UNVERIFIED_ERROR, code: "email_unverified" }, { status: 403 });
  }
  const uid = session.uid;
  const body = await req.json().catch(() => null);
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success || !mongoose.isValidObjectId(parsed.data.id)) {
    return NextResponse.json({ error: "Invalid account reference." }, { status: 400 });
  }
  await dbConnect();
  const deleted = await SocialAccount.findOneAndDelete({ _id: parsed.data.id, ownerId: uid });
  if (!deleted) {
    return NextResponse.json({ error: "Account not found or not yours." }, { status: 404 });
  }
  await Credential.deleteMany({ socialAccountId: deleted._id, ownerId: uid });
  await AuditLog.create({
    ownerId: uid,
    event: "account.disconnected",
    meta: { platform: deleted.platform },
  }).catch(() => {});
  return NextResponse.json({ ok: true });
}
