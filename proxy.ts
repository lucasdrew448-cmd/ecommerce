import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep this in sync with ADMIN_COOKIE_NAME in lib/auth.ts
const ADMIN_COOKIE_NAME = "headless_admin";

const EXTERNAL_ADMIN_AUTH_URL = process.env.EXTERNAL_ADMIN_AUTH_URL || "https://charlesdiscus.website";

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

/**
 * Verifies an opaque (non-JWT) token against the external admin auth
 * provider's `/verify` endpoint. This is the real verification step for
 * tokens issued by the provider that are not JWTs — we never accept an
 * opaque token on faith.
 */
async function verifyOpaqueToken(token: string): Promise<boolean> {
  try {
    const url = `${EXTERNAL_ADMIN_AUTH_URL.replace(/\/$/, "")}/next-api/external-admin/auth/verify`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { authenticated?: unknown };
    return data?.authenticated === true;
  } catch {
    return false;
  }
}

async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);

  // JWT: verify role and expiry locally (no network call needed).
  if (payload) {
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

  // Opaque token: verify against the external provider's /verify endpoint.
  return verifyOpaqueToken(token);
}

// Protect all /admin routes except the public auth pages
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login, register, and logout routes
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/register" ||
    pathname === "/admin/logout"
  ) {
    return NextResponse.next();
  }

  // Skip the auth check for Next.js prefetch requests. Prefetches are
  // issued by the router (e.g. when hovering a Link) and may not carry
  // the auth cookie, which would cause a spurious 307 redirect to login
  // and break client-side navigation. The real navigation request always
  // includes the cookie and is still protected below.
  //
  // Only the `Next-Router-Prefetch` header is trusted here — it is set by
  // the framework itself and cannot be forged via URL. The `_rsc` query
  // param is NOT used because it is attached by the App Router to every
  // client-side navigation (not just prefetches) and can be appended to
  // any URL by an attacker to bypass auth.
  const isPrefetch = request.headers.get("Next-Router-Prefetch") === "1";

  if (isPrefetch) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!(await isValidAdminToken(token))) {
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