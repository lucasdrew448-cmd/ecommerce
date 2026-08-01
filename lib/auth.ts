import type { NextResponse } from "next/server";

declare const process: {
  env: Record<string, string | undefined>;
};

const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-this-secret";
export const ADMIN_COOKIE_NAME = "headless_admin";

const EXTERNAL_ADMIN_AUTH_URL = process.env.EXTERNAL_ADMIN_AUTH_URL || "https://discus-web-app-2-0.onrender.com";

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

export function isValidAdminToken(token: string | undefined): boolean {
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

export function verifyAdminTokenFromHeaders(headers?: HeadersInit): boolean {
  const cookieHeader = getCookieHeaderFromHeaders(headers);
  const cookies = parseCookies(cookieHeader);
  return isValidAdminToken(cookies[ADMIN_COOKIE_NAME]);
}

function buildCookieValue(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function createAdminCookie(token: string): string {
  return buildCookieValue(token, ADMIN_COOKIE_MAX_AGE);
}

export function setAdminCookieOnResponse(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
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

export function clearAdminCookieOnResponse(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}
