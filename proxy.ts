/**
 * Route protection proxy.
 *
 * - /system/* (except /system/login) requires an authenticated ADMIN user.
 * - /system/login redirects already-authenticated admins to /system.
 * - /login and /registration redirect authenticated users away.
 *
 * API routes are protected by withApiHandler and are excluded from the matcher.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

function getUserFromToken(token: string | undefined) {
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = getUserFromToken(token);
  const { pathname } = req.nextUrl;

  const isProtectedSystemRoute =
    pathname.startsWith("/system") && pathname !== "/system/login";
  const isGuestOnlyRoute =
    pathname === "/login" || pathname === "/registration";

  if (isProtectedSystemRoute && (!user || user.role !== "ADMIN")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/system/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/system/login" && user?.role === "ADMIN") {
    const systemUrl = req.nextUrl.clone();
    systemUrl.pathname = "/system";
    return NextResponse.redirect(systemUrl);
  }

  if (isGuestOnlyRoute && user) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = user.role === "ADMIN" ? "/system" : "/";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/system/:path*", "/login", "/registration"],
};
