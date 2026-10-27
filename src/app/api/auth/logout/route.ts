import { NextResponse } from "next/server";
import { destroySession, revokeCurrentSession } from "@/lib/auth/session";
import { crossOriginBlock } from "@/lib/http/request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  try {
    // Revoke the JWT itself so a copied token stops working immediately, not just this browser.
    await revokeCurrentSession();
  } catch {
    // Database unavailable: still clear the cookie so the local session ends.
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
