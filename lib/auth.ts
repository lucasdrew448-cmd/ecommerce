import type { NextResponse } from "next/server";

declare const process: {
  env: Record<string, string | undefined>;
};

const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-this-secret";
export const ADMIN_COOKIE_NAME = "headless_admin";
const SECURE_ADMIN_COOKIE_NAME = "__Host-headless_admin";

const EXTERNAL_ADMIN_AUTH_URL = process.env.EXTERNAL_ADMIN_AUTH_URL || "https://charlesdiscus.website";

function getExternalAdminAuthUrl(): string {
  if (!EXTERNAL_ADMIN_AUTH_URL) {
    throw new Error("External admin auth URL not configured. Set EXTERNAL_ADMIN_AUTH_URL.");
  }
  return EXTERNAL_ADMIN_AUTH_URL.replace(/\/$/, "");
}

async function fetchExternalAdminAuth(path: string, body: unknown): Promise<unknown> {
  const url = `${getExternalAdminAuthUrl()}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let json: unknown = {};

  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
      json = rawText;
    }
  }

  if (!response.ok) {
    const message =
      typeof json === "object" && json !== null && "error" in json && typeof (json as Record<string, unknown>).error === "string"
        ? (json as Record<string, unknown>).error
        : typeof json === "string"
          ? json
          : "External auth failed";
    throw new Error(message as string);
  }

  return json;
}

export async function registerAdmin(email: string, password: string, fullName: string): Promise<unknown> {
  return fetchExternalAdminAuth("/next-api/external-admin/auth/register", {
    email,
    password,
    fullName,
    adminSecret: ADMIN_SECRET,
  });
}

export async function loginAdmin(email: string, password: string): Promise<unknown> {
  return fetchExternalAdminAuth("/next-api/external-admin/auth/login", {
    email,
    password,
    adminSecret: ADMIN_SECRET,
  });
}

export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce((cookies, pair) => {
    const [key, ...rest] = pair.split("=");
    if (!key) {
      return cookies;
    }
    cookies[key.trim()] = rest.join("=").trim();
    return cookies;
  }, {} as Record<string, string>);
}

function getCookieHeaderFromHeaders(headers?: HeadersInit | { get?: (name: string) => string | null } | Record<string, unknown>): string | null {
  if (!headers) {
    return null;
  }

  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as { get: (name: string) => string | null }).get("cookie");
  }

  if (headers instanceof Headers) {
    return headers.get("cookie");
  }

  if (Array.isArray(headers)) {
    const cookieEntry = headers.find(([name]) => name.toLowerCase() === "cookie");
    return cookieEntry ? cookieEntry[1] : null;
  }

  const header = (headers as Record<string, unknown>).cookie;
  return typeof header === "string" ? header : null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
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
    const url = `${getExternalAdminAuthUrl()}/next-api/external-admin/auth/verify`;
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

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
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

    // Only reject when we can positively confirm expiry.
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

function extractBearerToken(authHeader: string): string | null {
  const trimmed = authHeader.trim();
  const prefix = "bearer ";
  if (trimmed.toLowerCase().startsWith(prefix)) {
    const token = trimmed.slice(prefix.length).trim();
    return token.length > 0 ? token : null;
  }
  return null;
}

function getAuthHeaderFromHeaders(headers?: HeadersInit): string | null {
  if (!headers) {
    return null;
  }

  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as { get: (name: string) => string | null }).get("authorization");
  }

  if (Array.isArray(headers)) {
    const entry = headers.find(([name]) => name.toLowerCase() === "authorization");
    return entry ? (entry[1] as string) : null;
  }

  const value = (headers as Record<string, unknown>).authorization;
  return typeof value === "string" ? value : null;
}

export async function verifyAdminTokenFromHeaders(headers?: HeadersInit): Promise<boolean> {
  if (!headers) {
    return false;
  }

  const authHeader = getAuthHeaderFromHeaders(headers);
  if (authHeader) {
    const bearerToken = extractBearerToken(authHeader);
    if (bearerToken && (await isValidAdminToken(bearerToken))) {
      return true;
    }
  }

  const cookieHeader = getCookieHeaderFromHeaders(headers);
  const cookies = parseCookies(cookieHeader);
  return isValidAdminToken(cookies[ADMIN_COOKIE_NAME]) || isValidAdminToken(cookies[SECURE_ADMIN_COOKIE_NAME]);
}

export async function verifyAdminTokenFromCookies(cookiesObj: { get(name: string): { value: string } | undefined }): Promise<boolean> {
  const token = cookiesObj.get(SECURE_ADMIN_COOKIE_NAME)?.value ?? cookiesObj.get(ADMIN_COOKIE_NAME)?.value;
  return isValidAdminToken(token);
}

function getHeaderValue(name: string, headers?: HeadersInit): string | null {
  if (!headers) {
    return null;
  }

  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as { get: (name: string) => string | null }).get(name);
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (Array.isArray(headers)) {
    const entry = headers.find(([headerName]) => headerName.toLowerCase() === name.toLowerCase());
    return entry ? (entry[1] as string) : null;
  }

  const value = (headers as Record<string, unknown>)[name];
  return typeof value === "string" ? value : null;
}

function isSecureRequest(requestUrl?: string, headers?: HeadersInit): boolean {
  if (requestUrl) {
    if (requestUrl.startsWith("https://")) {
      return true;
    }

    if (requestUrl.startsWith("http://")) {
      return false;
    }
  }

  const forwardedProto = getHeaderValue("x-forwarded-proto", headers);
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
  }

  return process.env.NODE_ENV === "production";
}

function getAdminCookieName(requestUrl?: string, headers?: HeadersInit): string {
  return isSecureRequest(requestUrl, headers) ? SECURE_ADMIN_COOKIE_NAME : ADMIN_COOKIE_NAME;
}

function buildCookieValue(value: string, maxAgeSeconds: number, cookieName: string, isSecure: boolean) {
  const secure = isSecure ? "; Secure" : "";
  return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function createAdminCookie(token: string, requestUrl?: string, headers?: HeadersInit): string {
  return buildCookieValue(token, ADMIN_COOKIE_MAX_AGE, getAdminCookieName(requestUrl, headers), isSecureRequest(requestUrl, headers));
}

export function setAdminCookieOnResponse(response: NextResponse, token: string, requestUrl?: string, headers?: HeadersInit) {
  const isSecure = isSecureRequest(requestUrl, headers);
  const cookieName = getAdminCookieName(requestUrl, headers);

  response.cookies.set({
    name: cookieName,
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    secure: isSecure,
  });
}

export function extractTokenFromAuthResponse(response: unknown): string | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const obj = response as Record<string, unknown>;

  if (typeof obj.token === "string") return obj.token;
  if (typeof obj.accessToken === "string") return obj.accessToken;
  if (typeof obj.access_token === "string") return obj.access_token;
  if (typeof obj.jwt === "string") return obj.jwt;

  if (obj.data && typeof obj.data === "object") {
    const data = obj.data as Record<string, unknown>;
    if (typeof data.token === "string") return data.token;
    if (typeof data.accessToken === "string") return data.accessToken;
    if (typeof data.access_token === "string") return data.access_token;
    if (typeof data.jwt === "string") return data.jwt;
  }

  if (obj.result && typeof obj.result === "object") {
    const result = obj.result as Record<string, unknown>;
    if (typeof result.token === "string") return result.token;
    if (typeof result.accessToken === "string") return result.accessToken;
    if (typeof result.access_token === "string") return result.access_token;
    if (typeof result.jwt === "string") return result.jwt;
  }

  if (obj.user && typeof obj.user === "object") {
    const user = obj.user as Record<string, unknown>;
    if (typeof user.token === "string") return user.token;
    if (typeof user.accessToken === "string") return user.accessToken;
    if (typeof user.access_token === "string") return user.access_token;
  }

  return null;
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function clearAdminCookieOnResponse(response: NextResponse, requestUrl?: string, headers?: HeadersInit) {
  const isSecure = isSecureRequest(requestUrl, headers);
  const cookieName = getAdminCookieName(requestUrl, headers);

  response.cookies.set({
    name: cookieName,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    secure: isSecure,
  });

  if (isSecure) {
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      secure: true,
    });
  }
}
