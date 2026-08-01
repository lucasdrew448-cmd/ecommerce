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

function isValidAdminToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return false;
  }

  if (isJwtExpired(payload)) {
    return false;
  }

  return true;
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