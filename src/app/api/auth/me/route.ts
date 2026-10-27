import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { SocialAccount } from "@/models/SocialAccount";
import { OAuthAttempt } from "@/models/OAuthAttempt";
import { Credential } from "@/models/Credential";
import { Post, PostDestination } from "@/models/Post";
import { MediaAsset, Notification, EmailVerification, PasswordReset, AuditLog } from "@/models/library";
import { destroySession, activeSessionUserId } from "@/lib/auth/session";
import { crossOriginBlock } from "@/lib/http/request";
import { supabaseAdmin, storageBucket } from "@/lib/storage/supabase";

export const runtime = "nodejs";

function serialize(user: {
  _id: unknown;
  name: string;
  email: string;
  emailVerified: boolean;
  theme: string;
  timezone: string;
  preferences?: { emailOnPublish: boolean; emailOnFailure: boolean };
  createdAt: Date;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    theme: user.theme,
    timezone: user.timezone,
    preferences: {
      emailOnPublish: user.preferences?.emailOnPublish ?? true,
      emailOnFailure: user.preferences?.emailOnFailure ?? true,
    },
    createdAt: user.createdAt.toISOString(),
  };
}

export async function GET() {
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ user: null }, { status: 401 });
  await dbConnect();
  const user = await User.findById(uid).lean();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: serialize(user) });
}

const patchSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
  timezone: z.string().trim().min(1, "Timezone is required").max(64).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  preferences: z
    .object({
      emailOnPublish: z.boolean().optional(),
      emailOnFailure: z.boolean().optional(),
    })
    .optional(),
});

/** PATCH /api/auth/me — update the caller's own profile. Inherently owner-scoped. */
export async function PATCH(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  if (parsed.data.timezone) {
    try {
      const zones: string[] = Intl.supportedValuesOf("timeZone");
      if (!zones.includes(parsed.data.timezone)) {
        return NextResponse.json({ error: "Unknown timezone." }, { status: 400 });
      }
    } catch {
      // Intl timezone data unavailable — accept the value as provided.
    }
  }
  const update: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.timezone !== undefined) update.timezone = parsed.data.timezone;
  if (parsed.data.theme !== undefined) update.theme = parsed.data.theme;
  if (parsed.data.preferences?.emailOnPublish !== undefined) {
    update["preferences.emailOnPublish"] = parsed.data.preferences.emailOnPublish;
  }
  if (parsed.data.preferences?.emailOnFailure !== undefined) {
    update["preferences.emailOnFailure"] = parsed.data.preferences.emailOnFailure;
  }
  await dbConnect();
  const user = await User.findByIdAndUpdate(uid, { $set: update }, { new: true }).lean();
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ user: serialize(user) });
}

/** DELETE /api/auth/me — delete the workspace: user + every owned document (+ stored media, best-effort). */
export async function DELETE(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const uid = await activeSessionUserId();
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await dbConnect();

  // Best-effort storage cleanup before removing DB references.
  try {
    const media = await MediaAsset.find({ ownerId: uid, bucket: storageBucket() })
      .select("storagePath bucket")
      .lean();
    const byBucket = new Map<string, string[]>();
    for (const m of media) {
      const list = byBucket.get(m.bucket) ?? [];
      list.push(m.storagePath);
      byBucket.set(m.bucket, list);
    }
    if (byBucket.size > 0) {
      const admin = supabaseAdmin();
      for (const [bucket, paths] of byBucket) {
        await admin.storage.from(bucket).remove(paths);
      }
    }
  } catch {
    // Storage unconfigured or unreachable — continue with database deletion.
  }

  await Promise.all([
    SocialAccount.deleteMany({ ownerId: uid }),
    OAuthAttempt.deleteMany({ ownerId: uid }),
    Credential.deleteMany({ ownerId: uid }),
    Post.deleteMany({ ownerId: uid }),
    PostDestination.deleteMany({ ownerId: uid }),
    MediaAsset.deleteMany({ ownerId: uid }),
    Notification.deleteMany({ ownerId: uid }),
    EmailVerification.deleteMany({ userId: uid }),
    PasswordReset.deleteMany({ userId: uid }),
    AuditLog.deleteMany({ ownerId: uid }),
  ]);
  await User.deleteOne({ _id: uid });
  // Written after the purge so the deletion event itself survives as the only remaining record.
  await AuditLog.create({ ownerId: uid, event: "workspace.deleted", meta: {} });
  await destroySession();
  return NextResponse.json({ ok: true });
}
