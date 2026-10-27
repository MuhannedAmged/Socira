import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { buildContentSecurityPolicy } from "@/lib/http/csp";

const COOKIE = "socira_session";
const MIN_SECRET_LENGTH = 32;

/** Pages that require a session. Everything else stays public (marketing, docs, auth screens). */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/compose",
  "/calendar",
  "/posts",
  "/media",
  "/analytics",
  "/inbox",
  "/notifications",
  "/settings",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

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

  // A fresh nonce per request. Next.js reads it from the CSP request header and applies it to the
  // framework/page scripts during server rendering, so the pages must render dynamically.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const authed = await hasValidSession(req);
  if (!authed && isProtected(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("Content-Security-Policy", contentSecurityPolicy);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  // Run for pages only: API routes carry JSON (no scripts) and static assets need no nonce.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
