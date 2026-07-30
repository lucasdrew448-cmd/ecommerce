import crypto from "crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-this-secret";
export const ADMIN_COOKIE_NAME = "headless_admin";

function computeToken(username: string, password: string) {
  return crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${username}:${password}`)
    .digest("hex");
}

export function verifyAdminCredentials(username: unknown, password: unknown): boolean {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  );
}

export function getAdminToken(): string {
  return computeToken(ADMIN_USERNAME, ADMIN_PASSWORD);
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
