import type { NextResponse } from "next/server";

declare function require(moduleName: string): any;
declare const process: {
  env: Record<string, string | undefined>;
};

const crypto = require("crypto") as {
  createHmac: (algorithm: string, key: string) => {
    update: (data: string) => {
      digest: (encoding: string) => string;
    };
  };
};

const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-this-secret";
export const ADMIN_COOKIE_NAME = "headless_admin";

const EXTERNAL_ADMIN_AUTH_URL = process.env.EXTERNAL_ADMIN_AUTH_URL || "https://discus-web-app-2-0.onrender.com";

function computeToken(secret: string) {
  return crypto.createHmac("sha256", ADMIN_SECRET).update(secret).digest("hex");
}

export function getAdminToken(): string {
  return computeToken(ADMIN_SECRET);
}

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

export function verifyAdminTokenFromHeaders(headers?: HeadersInit): boolean {
  const cookieHeader = getCookieHeaderFromHeaders(headers);
  const cookies = parseCookies(cookieHeader);
  return cookies[ADMIN_COOKIE_NAME] === getAdminToken();
}

function buildCookieValue(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function createAdminCookie(): string {
  return buildCookieValue(getAdminToken(), ADMIN_COOKIE_MAX_AGE);
}

export function setAdminCookieOnResponse(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: getAdminToken(),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
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
