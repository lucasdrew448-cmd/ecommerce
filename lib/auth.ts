import crypto from "crypto";

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

  const json = await response.json();
  if (!response.ok) {
    throw new Error((json && typeof json === "object" && "error" in json ? (json as Record<string, unknown>).error : "External auth failed") as string);
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

export function verifyAdminTokenFromHeaders(headers?: HeadersInit): boolean {
  if (!headers) {
    return false;
  }

  let cookieHeader: string | null = null;

  if (headers instanceof Headers) {
    cookieHeader = headers.get("cookie");
  } else if (Array.isArray(headers)) {
    const cookieEntry = headers.find(([name]) => name.toLowerCase() === "cookie");
    cookieHeader = cookieEntry ? cookieEntry[1] : null;
  } else {
    const header = (headers as Record<string, unknown>)["cookie"];
    cookieHeader = typeof header === "string" ? header : null;
  }

  const cookies = parseCookies(cookieHeader);
  return cookies[ADMIN_COOKIE_NAME] === getAdminToken();
}

function buildCookieValue(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function createAdminCookie(): string {
  return buildCookieValue(getAdminToken(), 60 * 60 * 24 * 7);
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
