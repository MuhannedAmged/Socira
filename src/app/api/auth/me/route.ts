import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { sessionUserId } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ user: null }, { status: 401 });
  await dbConnect();
  const user = await User.findById(uid).lean();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      theme: user.theme,
      timezone: user.timezone,
    },
  });
}
