import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "socira_session";
const MIN_SECRET_LENGTH = 32;

/** Cheap signature check only — the database-backed status check happens in each route handler. */
async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret || secret.length < MIN_SECRET_LENGTH) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await hasValidSession(req);
  const isAuthScreen = pathname === "/login" || pathname === "/register";

  // Auth screens stay reachable even with a stale-but-valid token: a suspended account must be
  // able to land on /login instead of being bounced between the dashboard and itself.
  if (!authed && !isAuthScreen) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/compose/:path*",
    "/calendar/:path*",
    "/posts/:path*",
    "/media/:path*",
    "/analytics/:path*",
    "/inbox/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
