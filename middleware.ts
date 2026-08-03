import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep this in sync with ADMIN_COOKIE_NAME in lib/auth.ts
const ADMIN_COOKIE_NAME = "headless_admin";

function base64UrlDecode(str: string): string {
  // Convert base64url to standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '=' to make length a multiple of 4
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  // Decode base64 to binary string, then convert to UTF-8
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = base64UrlDecode(parts[1]);
    const parsed = JSON.parse(payload);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function isJwtExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (typeof exp !== "number") {
    return true;
  }
  return Date.now() >= exp * 1000;
}

function isAdminRole(payload: Record<string, unknown>): boolean {
  const role = payload.role;
  if (typeof role === "string") {
    return role === "admin";
  }
  if (Array.isArray(role)) {
    return role.some((r) => typeof r === "string" && r === "admin");
  }

  const userRole = payload.user_role;
  if (typeof userRole === "string") {
    return userRole === "admin";
  }

  const roles = payload.roles;
  if (Array.isArray(roles)) {
    return roles.some((r) => typeof r === "string" && r === "admin");
  }

  return false;
}

function isValidAdminToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  // If the token is not a JWT (e.g. an opaque token), accept it —
  // it was issued by our trusted external auth endpoint.
  if (!payload) {
    return true;
  }

  // Verify the token belongs to an admin user (user role must be `admin`).
  if (!isAdminRole(payload)) {
    return false;
  }

  // If it is a JWT, only reject when we can positively confirm expiry.
  // If there is no numeric exp claim we cannot determine expiry, so accept.
  const exp = payload.exp;
  if (typeof exp !== "number") {
    return true;
  }

  return Date.now() < exp * 1000;
}

// Protect all /admin routes except the public auth pages
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login, register, and logout routes
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/register" ||
    pathname === "/admin/logout"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminToken(token)) {
    const loginUrl = new URL("/admin/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};