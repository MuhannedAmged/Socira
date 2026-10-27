import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { consumePasswordReset } from "@/lib/auth/password-reset";
import { destroySession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit/memory";
import { crossOriginBlock, rateKey } from "@/lib/http/request";
import { resetSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  if (
    !rateLimit(rateKey("reset:ip", req), 20, 15 * 60_000).ok ||
    !rateLimit(`reset:${parsed.data.token.slice(0, 8)}`, 8, 15 * 60_000).ok
  ) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }
  await dbConnect();
  const result = await consumePasswordReset(parsed.data.token, parsed.data.password);
  if (result !== "ok") {
    return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  }
  // Clear this browser's cookie too; every other session is rejected by the version bump.
  await destroySession();
  return NextResponse.json({ ok: true });
}
