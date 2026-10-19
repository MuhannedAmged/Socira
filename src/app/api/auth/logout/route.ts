import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { crossOriginBlock } from "@/lib/http/request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cross = crossOriginBlock(req);
  if (cross) return cross;
  await destroySession();
  return NextResponse.json({ ok: true });
}
