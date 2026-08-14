import type { Category, HeroBanner, Order, Product, ProductType, Review, Supplier, UploadResult } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/products";
import { ADMIN_COOKIE_NAME, parseCookies } from "@/lib/auth";

declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_COMMERCE_API_URL = "https://www.charlesdiscus.website/api";
const API_KEY = process.env.X_API_KEY || process.env.API_KEY;

export type AdminProductInput = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  image?: string;
  image_url?: string;
  images?: string[];
  details?: string[];
  category_id?: string;
  product_type_id?: string;
  supplier_id?: string;
  stock?: number;
  additional_images?: string[] | string;
  sizes?: string[] | string | Array<{ size: string; price?: number }>;
};

export type AdminOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: string[];
  shippingAddress?: string;
  shippingDestination?: string;
  shippingMethod?: string;
  shippingCost?: number;
  ipAddress?: string;
  orderItems: AdminOrderItem[];
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
};

const FALLBACK_ORDERS: AdminOrder[] = [
  {
    id: "ord_1001",
    customer: "Amina Stone",
    email: "amina@example.com",
    total: 298,
    status: "Processing",
    createdAt: "2026-07-28",
    items: ["Essential Tracker", "Artisan Everyday Bag"],
    shippingAddress: "12 Market Street, Austin, TX 78701",
    shippingDestination: "United States",
    shippingMethod: "Standard",
    shippingCost: 12,
    ipAddress: "203.0.113.5",
    orderItems: [
      { productId: "prod_essential_tracker", name: "Essential Tracker", quantity: 1, price: 149 },
      { productId: "prod_artisan_bag", name: "Artisan Everyday Bag", quantity: 1, price: 149 },
    ],
  },
  {
    id: "ord_1002",
    customer: "Noah Chen",
    email: "noah@example.com",
    total: 129,
    status: "Shipped",
    createdAt: "2026-07-29",
    items: ["Comfort Sneaker"],
    shippingAddress: "45 Harbor Road, Seattle, WA 98101",
    shippingDestination: "United States",
    shippingMethod: "Express",
    shippingCost: 18,
    ipAddress: "198.51.100.22",
    orderItems: [{ productId: "prod_comfort_sneaker", name: "Comfort Sneaker", quantity: 1, price: 129 }],
  },
];

let adminProductStore: Product[] = FALLBACK_PRODUCTS.map((product) => ({ ...product }));
let adminOrderStore: AdminOrder[] = FALLBACK_ORDERS.map((order) => ({ ...order }));

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_COMMERCE_API_URL || process.env.COMMERCE_API_URL || DEFAULT_COMMERCE_API_URL;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveImageValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.image === "string") return obj.image;
    if (typeof obj.image_url === "string") return obj.image_url;
    if (typeof obj.imageUrl === "string") return obj.imageUrl;
    if (typeof obj.url === "string") return obj.url;
  }

  return undefined;
}

function parseJsonArray(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

/**
 * Normalizes a value that may be a JSON array, a pre-encoded JSON string,
 * or an array of objects (e.g. sizes with prices) into a canonical JSON
 * string. This lets callers pass either format straight through from a
 * GET response without double-encoding.
 */
function normalizeToJsonString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    // Already a string — try to parse it so we can re-stringify for
    // canonical formatting. If it isn't valid JSON, keep the raw string.
    const parsed = parseJsonArray(value);
    if (Array.isArray(parsed) || (parsed && typeof parsed === "object")) {
      return JSON.stringify(parsed);
    }
    return value;
  }

  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return JSON.stringify(value);
  }

  return undefined;
}

function normalizeImageArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(resolveImageValue)
      .filter((src): src is string => typeof src === "string" && src.length > 0);
  }

  if (typeof value === "string") {
    const parsed = parseJsonArray(value);
    if (Array.isArray(parsed)) {
      return normalizeImageArray(parsed);
    }

    const resolved = resolveImageValue(parsed);
    return resolved ? [resolved] : [value];
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (Array.isArray(obj.images)) return normalizeImageArray(obj.images);
    if (Array.isArray(obj.urls)) return normalizeImageArray(obj.urls);

    const resolved = resolveImageValue(obj);
    if (resolved) return [resolved];

    return Object.values(obj).flatMap(normalizeImageArray);
  }

  return [];
}

function toProduct(input: AdminProductInput, existing?: Product): Product {
  const productName = input.name || existing?.name || "Untitled Product";
  const slug = input.slug || existing?.slug || createSlug(productName);
  const id = input.id || existing?.id || `prod_${Date.now()}`;

  const mainImage =
    input.image ||
    input.image_url ||
    existing?.image ||
    (typeof input.images?.[0] === "string" ? input.images[0] : undefined);

  // Normalize additional_images (which may be a JSON string or array)
  // into a flat string array before spreading, so we don't accidentally
  // spread individual characters of a JSON-encoded string.
  const additionalImagesArray =
    input.additional_images !== undefined ? normalizeImageArray(input.additional_images) : [];

  const allImages = [mainImage, ...(input.images ?? []), ...additionalImagesArray].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

  return {
    id,
    slug,
    name: productName,
    description: input.description || existing?.description || "",
    price: typeof input.price === "number" && Number.isFinite(input.price) ? input.price : (existing?.price ?? 0),
    currency: input.currency || existing?.currency || "$",
    image: mainImage,
    image_url: input.image_url || input.image || existing?.image_url || existing?.image,
    images: allImages.length ? allImages : existing?.images,
    details: input.details || existing?.details || [],
    category_id: input.category_id || existing?.category_id,
    product_type_id: input.product_type_id || existing?.product_type_id,
    supplier_id: input.supplier_id || existing?.supplier_id,
    stock: input.stock ?? existing?.stock,
    additional_images: input.additional_images !== undefined ? normalizeToJsonString(input.additional_images) : existing?.additional_images,
    sizes: input.sizes !== undefined ? normalizeToJsonString(input.sizes) : existing?.sizes,
  };
}

function normalizeProduct(item: unknown): Product {
  const product = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  const price = toNumber(product.price, 0);
  const name = typeof product.name === "string" ? product.name : "Untitled Product";
  const mainImage =
    resolveImageValue(product.image) ??
    resolveImageValue(product.image_url) ??
    resolveImageValue(product.imageUrl);

  const directImages = normalizeImageArray(product.images);
  const additionalImages = normalizeImageArray(
    typeof product.additional_images === "string"
      ? parseJsonArray(product.additional_images)
      : product.additional_images
  );

  const orderedImages = [mainImage, ...directImages, ...additionalImages].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

  return {
    id: typeof product.id === "string" ? product.id : String(product.slug ?? name ?? `prod_${Date.now()}`),
    slug: typeof product.slug === "string" ? product.slug : createSlug(name),
    name,
    description: typeof product.description === "string" ? product.description : "",
    price: Number.isFinite(price) ? price : 0,
    currency: typeof product.currency === "string" ? product.currency : "$",
    image: mainImage,
    image_url: typeof product.image_url === "string" ? product.image_url : mainImage,
    images: orderedImages.length ? orderedImages : undefined,
    details: Array.isArray(product.details)
      ? (product.details as unknown[]).filter((value): value is string => typeof value === "string")
      : [],
    category_id: typeof product.category_id === "string" ? product.category_id : undefined,
    product_type_id: typeof product.product_type_id === "string" ? product.product_type_id : undefined,
    supplier_id: typeof product.supplier_id === "string" ? product.supplier_id : undefined,
    stock: typeof product.stock === "number" ? product.stock : undefined,
    additional_images: normalizeToJsonString(product.additional_images),
    sizes: normalizeToJsonString(product.sizes),
    created_at: typeof product.created_at === "string" ? product.created_at : undefined,
    updated_at: typeof product.updated_at === "string" ? product.updated_at : undefined,
  };
}

function normalizeProducts(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data.map(normalizeProduct);
  }

  if (data && typeof data === "object") {
    const objectData = data as Record<string, unknown>;
    if (Array.isArray(objectData.products)) {
      return objectData.products.map(normalizeProduct);
    }
    if (Array.isArray(objectData.data)) {
      return objectData.data.map(normalizeProduct);
    }
    if (objectData.product) {
      return [normalizeProduct(objectData.product)];
    }
  }

  return adminProductStore;
}

function normalizeOrder(item: unknown): AdminOrder {
  const order = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  const total = toNumber(order.total_price ?? order.total, 0);

  const detailedItems: AdminOrderItem[] = Array.isArray(order.order_items)
    ? (order.order_items as unknown[]).map((value) => {
        if (value && typeof value === "object") {
          const obj = value as Record<string, unknown>;
          const name =
            typeof obj.product_name === "string"
              ? obj.product_name
              : typeof obj.name === "string"
                ? obj.name
                : String(obj.product_id ?? "Item");
          return {
            productId: typeof obj.product_id === "string" ? obj.product_id : "",
            name,
            quantity: toNumber(obj.quantity, 1),
            price: toNumber(obj.price, 0),
          };
        }
        return { productId: "", name: String(value ?? "Item"), quantity: 1, price: 0 };
      })
    : [];

  return {
    id: typeof order.id === "string" ? order.id : typeof order.order_id === "string" ? order.order_id : `ord_${Date.now()}`,
    customer: typeof order.customer_name === "string" ? order.customer_name : "Guest",
    email: typeof order.customer_email === "string" ? order.customer_email : "guest@example.com",
    total: Number.isFinite(total) ? total : 0,
    status: typeof order.status === "string" ? order.status : "Pending",
    createdAt: typeof order.created_at === "string" ? order.created_at : new Date().toISOString(),
    items: detailedItems.map((detailedItem) => detailedItem.name).filter(Boolean),
    shippingAddress: typeof order.shipping_address === "string" ? order.shipping_address : undefined,
    shippingDestination: typeof order.shipping_destination === "string" ? order.shipping_destination : undefined,
    shippingMethod: typeof order.shipping_method === "string" ? order.shipping_method : undefined,
    shippingCost: order.shipping_cost !== undefined ? toNumber(order.shipping_cost, 0) : undefined,
    ipAddress: typeof order.ip_address === "string" ? order.ip_address : undefined,
    orderItems: detailedItems,
    billingAddress: typeof order.billing_address === "string" ? order.billing_address : undefined,
    billingCity: typeof order.billing_city === "string" ? order.billing_city : undefined,
    billingState: typeof order.billing_state === "string" ? order.billing_state : undefined,
    billingZip: typeof order.billing_zip === "string" ? order.billing_zip : undefined,
    billingCountry: typeof order.billing_country === "string" ? order.billing_country : undefined,
    // card_cvv is intentionally never read here — it must not be surfaced
    // or persisted beyond the initial payment authorization.
    cardName: typeof order.card_name === "string" ? order.card_name : undefined,
    cardNumber: typeof order.card_number === "string" ? order.card_number : undefined,
    cardExpiry: typeof order.card_expiry === "string" ? order.card_expiry : undefined,
  };
}

function normalizeOrders(data: unknown): AdminOrder[] {
  if (Array.isArray(data)) {
    return data.map(normalizeOrder);
  }

  if (data && typeof data === "object") {
    const objectData = data as Record<string, unknown>;
    if (Array.isArray(objectData.orders)) {
      return objectData.orders.map(normalizeOrder);
    }
    if (Array.isArray(objectData.data)) {
      return objectData.data.map(normalizeOrder);
    }
  }

  return adminOrderStore;
}

function normalizeCategory(item: unknown): Category {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  return {
    id: typeof value.id === "string" ? value.id : String(value.name ?? "unknown"),
    name: typeof value.name === "string" ? value.name : "Untitled Category",
    description: typeof value.description === "string" ? value.description : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
  };
}

function normalizeProductType(item: unknown): ProductType {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  return {
    id: typeof value.id === "string" ? value.id : String(value.name ?? "unknown"),
    name: typeof value.name === "string" ? value.name : "Untitled Type",
    description: typeof value.description === "string" ? value.description : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
  };
}

function normalizeSupplier(item: unknown): Supplier {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  return {
    id: typeof value.id === "string" ? value.id : String(value.name ?? "unknown"),
    name: typeof value.name === "string" ? value.name : "Untitled Supplier",
    description: typeof value.description === "string" ? value.description : undefined,
    contact_person: typeof value.contact_person === "string" ? value.contact_person : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    phone: typeof value.phone === "string" ? value.phone : undefined,
    address: typeof value.address === "string" ? value.address : undefined,
    city: typeof value.city === "string" ? value.city : undefined,
    country: typeof value.country === "string" ? value.country : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
  };
}

function normalizeHeroBanner(item: unknown): HeroBanner {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  return {
    id: typeof value.id === "string" ? value.id : String(value.url ?? "unknown"),
    url: typeof value.url === "string" ? value.url : "",
    title: typeof value.title === "string" ? value.title : undefined,
    description: typeof value.description === "string" ? value.description : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
  };
}

function normalizeReview(item: unknown): Review {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;

  const users = value.users && typeof value.users === "object"
    ? (value.users as Record<string, unknown>)
    : undefined;

  const products = value.products && typeof value.products === "object"
    ? (value.products as Record<string, unknown>)
    : undefined;

  return {
    id: typeof value.id === "string" ? value.id : "unknown",
    product_id: typeof value.product_id === "string" ? value.product_id : "",
    user_id: typeof value.user_id === "string" ? value.user_id : "",
    rating: toNumber(value.rating, 0),
    title: typeof value.title === "string" ? value.title : undefined,
    comment: typeof value.comment === "string" ? value.comment : undefined,
    status: typeof value.status === "string" ? value.status : "pending",
    helpful_count: typeof value.helpful_count === "number" ? value.helpful_count : 0,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
    users: users
      ? {
          id: typeof users.id === "string" ? users.id : "",
          full_name: typeof users.full_name === "string" ? users.full_name : undefined,
          email: typeof users.email === "string" ? users.email : undefined,
        }
      : undefined,
    products: products
      ? {
          id: typeof products.id === "string" ? products.id : "",
          name: typeof products.name === "string" ? products.name : undefined,
        }
      : undefined,
  };
}

function normalizeArray<T>(data: unknown, mapper: (item: unknown) => T): T[] {
  if (Array.isArray(data)) {
    return data.map(mapper);
  }

  if (data && typeof data === "object") {
    const objectData = data as Record<string, unknown>;
    if (Array.isArray(objectData.data)) {
      return objectData.data.map(mapper);
    }
    if (Array.isArray(objectData.results)) {
      return objectData.results.map(mapper);
    }
  }

  return [];
}

// Headers that must never be forwarded from the original request to the
// upstream API. Forwarding these can break the upstream request:
// - content-length / content-type are re-generated for the new body
// - host points at our own server, not the upstream host
// - connection / keep-alive manage our connection, not the upstream one
// - accept-encoding may cause undici/upstream decompression mismatches
// - accept / accept-language are irrelevant and can cause upstream issues
const BLOCKED_HEADERS = new Set([
  "content-length",
  "content-type",
  "host",
  "connection",
  "keep-alive",
  "accept",
  "accept-encoding",
  "accept-language",
  "referer",
  "origin",
  "user-agent",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip",
  "upgrade",
  "transfer-encoding",
]);

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {};

  if (!headers) {
    return normalized;
  }

  if (typeof (headers as { get?: unknown }).get === "function") {
    // Prefer the Headers API for extraction — only forward the auth-relevant
    // headers (cookie + authorization), never the full header set.
    const cookieValue = (headers as { get: (name: string) => string | null }).get("cookie");
    if (cookieValue) {
      normalized.cookie = cookieValue;
    }
    const authValue = (headers as { get: (name: string) => string | null }).get("authorization");
    if (authValue) {
      normalized.authorization = authValue;
    }
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      if (typeof value === "string" && !BLOCKED_HEADERS.has(key.toLowerCase())) {
        normalized[key] = value;
      }
    });
  } else {
    const raw = headers as Record<string, unknown>;
    if (typeof raw.forEach === "function") {
      (raw as { forEach: (callback: (value: string, key: string) => void) => void }).forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!BLOCKED_HEADERS.has(lowerKey)) {
          normalized[lowerKey] = value;
        }
      });
    } else {
      Object.entries(raw).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (typeof value === "string" && !BLOCKED_HEADERS.has(lowerKey)) {
          normalized[lowerKey] = value;
        }
      });
    }
  }

  // The upstream commerce API expects an Authorization: Bearer <token>
  // header, but the admin token is stored in an HttpOnly cookie. Convert
  // the cookie into a Bearer token so authenticated admin requests
  // (create/update/delete) are authorized by the upstream API.
  if (!normalized.authorization && normalized.cookie) {
    const cookies = parseCookies(normalized.cookie);
    const token = cookies[ADMIN_COOKIE_NAME] ?? cookies["__Host-headless_admin"];
    if (token) {
      normalized.authorization = `Bearer ${token}`;
    }
  }

  return normalized;
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Handle AbortController timeout errors
  if (error.name === "AbortError" || error.message.includes("aborted")) {
    return true;
  }

  // Node's undici surfaces transient upstream connection resets (common
  // with Render's free-tier cold starts) as "fetch failed" with a cause
  // such as SocketError / UND_ERR_SOCKET. Retry these so the admin
  // mutation succeeds once the upstream service finishes spinning up.
  const cause = (error as { cause?: unknown }).cause;
  const causeMessage = cause instanceof Error ? cause.message : "";
  const causeCode = cause && typeof cause === "object" ? (cause as { code?: string }).code : undefined;

  return (
    error.message.includes("fetch failed") ||
    error.message.includes("socket hang up") ||
    error.message.includes("network") ||
    causeMessage.includes("other side closed") ||
    causeMessage.includes("ECONNRESET") ||
    causeMessage.includes("ETIMEDOUT") ||
    causeMessage.includes("socket hang up") ||
    causeCode === "UND_ERR_SOCKET" ||
    causeCode === "ECONNRESET" ||
    causeCode === "ETIMEDOUT"
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchCommerceApi<T>(path: string, init?: RequestInit, forwardedHeaders?: HeadersInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("Commerce API URL not configured.");
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = normalizedBase.includes("/api") && normalizedPath.startsWith("/api")
    ? `${normalizedBase}${normalizedPath.replace("/api", "")}`
    : `${normalizedBase}${normalizedPath}`;

  const isFormDataBody = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const mergedHeaders: Record<string, string> = {
    ...normalizeHeaders(init?.headers),
    ...normalizeHeaders(forwardedHeaders),
    ...(init?.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
  };
  if (API_KEY) {
    mergedHeaders["x-api-key"] = API_KEY;
  }

  // Debug: show which headers will be forwarded upstream for troubleshooting
  // (do not log raw tokens in production)
  try {
    const masked = { ...mergedHeaders } as Record<string, string>;
    if (masked.authorization) {
      masked.authorization = masked.authorization.replace(/(Bearer\s+).+$/, '$1<redacted>');
    }
    console.debug(`[fetchCommerceApi] forwarding headers for ${path}:`, masked);
  } catch (e) {
    // ignore logging errors
  }

  // When sending a FormData body, let the runtime set the correct
  // multipart Content-Type (with a matching boundary). Forwarding the
  // original request's content-type/content-length breaks multipart
  // parsing on the upstream API because the boundary no longer matches
  // the freshly serialized body.
  if (isFormDataBody) {
    delete mergedHeaders["content-type"];
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-length"];
    delete mergedHeaders["Content-Length"];
  }

  // Render free-tier services can take 30-60+ seconds to cold start.
  // Use a generous per-attempt timeout and exponential backoff between
  // retries so the admin mutation succeeds once the service finishes
  // spinning up.
  const maxAttempts = 5;
  const requestTimeoutMs = 30_000;
  const backoffBaseMs = 3_000;
  let lastError: unknown;

  // Use manual redirect handling so we can re-issue the request with the
  // same method and body to the redirected URL. Node's fetch converts
  // POST → GET on 301/302 redirects, which would drop the body and cause
  // a 500 error.
  const redirect = "manual" as const;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      let response = await fetchWithTimeout(url, {
        cache: "no-store",
        ...init,
        redirect,
        headers: mergedHeaders,
      }, requestTimeoutMs);

      // Handle redirects manually to preserve the HTTP method and body.
      // Node's fetch would otherwise convert POST → GET on 301/302.
      let currentUrl = url;
      let currentResponse = response;
      let redirectCount = 0;
      while (currentResponse.status >= 300 && currentResponse.status < 400 && redirectCount < 5) {
        const location = currentResponse.headers.get("location");
        if (!location) break;
        currentUrl = new URL(location, currentUrl).toString();
        currentResponse = await fetchWithTimeout(currentUrl, {
          cache: "no-store",
          ...init,
          redirect,
          headers: mergedHeaders,
        }, requestTimeoutMs);
        redirectCount += 1;
      }
      response = currentResponse;

      const rawText = await response.text();
      let json: unknown = undefined;

      if (rawText) {
        try {
          json = JSON.parse(rawText);
        } catch {
          json = rawText;
        }
      }

      if (!response.ok) {
        const message =
          json && typeof json === "object" && "error" in json && typeof (json as Record<string, unknown>).error === "string"
            ? (json as Record<string, unknown>).error as string
            : `Request to ${path} failed (${response.status}).`;
        throw new Error(message);
      }

      return json as T;
    } catch (error) {
      lastError = error;

      // Retry transient socket/connection failures (Render cold starts),
      // but rethrow immediately for non-retryable errors (e.g. 401/400).
      if (attempt < maxAttempts && isRetryableFetchError(error)) {
        const backoffMs = backoffBaseMs * attempt;
        console.warn(`[fetchCommerceApi] ${path} attempt ${attempt}/${maxAttempts} failed, retrying in ${backoffMs}ms`, error instanceof Error ? error.message : error);
        await delay(backoffMs);
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Request to ${path} failed after ${maxAttempts} attempts.`);
}

export async function listAdminProducts(headers?: HeadersInit): Promise<Product[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/api/products", undefined, headers);
    const products = normalizeProducts(data);
    adminProductStore = products;
    return products;
  } catch {
    return adminProductStore.map((product) => ({ ...product }));
  }
}

/**
 * Builds the API-spec-compliant payload for create/update product requests.
 * Only sends the fields the upstream /api/products endpoint expects:
 * name, description, price, stock, category_id, product_type_id,
 * supplier_id, image_url, additional_images, sizes.
 */
function toApiProductPayload(product: Product): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: product.name,
    description: product.description,
    price: product.price,
  };

  if (product.stock !== undefined) payload.stock = product.stock;
  if (product.category_id) payload.category_id = product.category_id;
  if (product.product_type_id) payload.product_type_id = product.product_type_id;
  if (product.supplier_id) payload.supplier_id = product.supplier_id;
  if (product.image_url) payload.image_url = product.image_url;
  if (product.additional_images !== undefined) payload.additional_images = product.additional_images;
  if (product.sizes !== undefined) payload.sizes = product.sizes;

  return payload;
}

export async function createAdminProduct(input: AdminProductInput, headers?: HeadersInit): Promise<Product> {
  const product = toProduct(input);
  const payload = toApiProductPayload(product);

  const data = await fetchCommerceApi<unknown>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  }, headers);
  const normalizedProduct = normalizeProduct(data);
  adminProductStore = [normalizedProduct, ...adminProductStore.filter((item) => item.id !== normalizedProduct.id)];
  return normalizedProduct;
}

export async function updateAdminProduct(id: string, input: AdminProductInput, headers?: HeadersInit): Promise<Product> {
  const existingProduct = adminProductStore.find((product) => product.id === id || product.slug === id);
  const product = toProduct(input, existingProduct);
  const payload = toApiProductPayload(product);

  const data = await fetchCommerceApi<unknown>(`/api/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, headers);
  const normalizedProduct = normalizeProduct(data);
  adminProductStore = adminProductStore.map((item) => (item.id === id || item.slug === id ? normalizedProduct : item));
  return normalizedProduct;
}

export async function deleteAdminProduct(id: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }, headers);

  adminProductStore = adminProductStore.filter((product) => product.id !== id && product.slug !== id);
}

export async function listAdminOrders(headers?: HeadersInit): Promise<AdminOrder[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/api/orders", undefined, headers);
    const orders = normalizeOrders(data);
    adminOrderStore = orders;
    return orders;
  } catch {
    return adminOrderStore.map((order) => ({ ...order }));
  }
}

export async function updateOrderStatus(orderId: string, status: string, headers?: HeadersInit): Promise<unknown> {
  return fetchCommerceApi<unknown>(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }, headers);
}

export async function sendPaymentStatusEmail(orderId: string, paymentStatus: string, headers?: HeadersInit): Promise<unknown> {
  return fetchCommerceApi<unknown>(`/api/orders/${encodeURIComponent(orderId)}/payment-status`, {
    method: "POST",
    body: JSON.stringify({ paymentStatus }),
  }, headers);
}

export async function listCategories(headers?: HeadersInit): Promise<Category[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/api/categories", undefined, headers);
    return normalizeArray(data, normalizeCategory);
  } catch {
    return [];
  }
}

export async function createCategory(input: { name: string; description?: string }, headers?: HeadersInit): Promise<Category> {
  const data = await fetchCommerceApi<unknown>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  }, headers);
  return normalizeCategory(data);
}

export async function updateCategory(id: string, input: { name?: string; description?: string }, headers?: HeadersInit): Promise<Category> {
  const data = await fetchCommerceApi<unknown>(`/api/categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }, headers);
  return normalizeCategory(data);
}

export async function deleteCategory(id: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/api/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }, headers);
}

export async function listProductTypes(headers?: HeadersInit): Promise<ProductType[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/api/product-types", undefined, headers);
    return normalizeArray(data, normalizeProductType);
  } catch {
    return [];
  }
}

export async function createProductType(input: { name: string; description?: string }, headers?: HeadersInit): Promise<ProductType> {
  const data = await fetchCommerceApi<unknown>("/api/product-types", {
    method: "POST",
    body: JSON.stringify(input),
  }, headers);
  return normalizeProductType(data);
}

export async function updateProductType(id: string, input: { name?: string; description?: string }, headers?: HeadersInit): Promise<ProductType> {
  const data = await fetchCommerceApi<unknown>(`/api/product-types/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }, headers);
  return normalizeProductType(data);
}

export async function deleteProductType(id: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/api/product-types/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }, headers);
}

export async function listSuppliers(headers?: HeadersInit): Promise<Supplier[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/api/suppliers", undefined, headers);
    return normalizeArray(data, normalizeSupplier);
  } catch {
    return [];
  }
}

export async function createSupplier(input: Record<string, unknown>, headers?: HeadersInit): Promise<Supplier> {
  const data = await fetchCommerceApi<unknown>("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(input),
  }, headers);
  return normalizeSupplier(data);
}

export async function updateSupplier(id: string, input: Record<string, unknown>, headers?: HeadersInit): Promise<Supplier> {
  const data = await fetchCommerceApi<unknown>(`/api/suppliers/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }, headers);
  return normalizeSupplier(data);
}

export async function deleteSupplier(id: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/api/suppliers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }, headers);
}

export async function listHeroBanners(headers?: HeadersInit): Promise<HeroBanner[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/api/hero", undefined, headers);
    return normalizeArray(data, normalizeHeroBanner);
  } catch {
    return [];
  }
}

export async function createHeroBanner(input: { url: string; title?: string; description?: string }, headers?: HeadersInit): Promise<HeroBanner> {
  const data = await fetchCommerceApi<unknown>("/api/hero", {
    method: "POST",
    body: JSON.stringify(input),
  }, headers);
  return normalizeHeroBanner(data);
}

export async function updateHeroBanner(id: string, input: { url?: string; title?: string; description?: string }, headers?: HeadersInit): Promise<HeroBanner> {
  const data = await fetchCommerceApi<unknown>(`/api/hero/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }, headers);
  return normalizeHeroBanner(data);
}

export async function deleteHeroBanner(id: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/api/hero/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }, headers);
}

export async function listAdminReviews(params?: { product_id?: string; status?: string; limit?: number; offset?: number }, headers?: HeadersInit): Promise<{ data: Review[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.product_id) query.set("product_id", params.product_id);
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    const data = await fetchCommerceApi<unknown>(`/api/reviews${qs ? `?${qs}` : ""}`, undefined, headers);

    if (data && typeof data === "object") {
      const objectData = data as Record<string, unknown>;
      const reviews = normalizeArray(objectData.data ?? objectData.reviews, normalizeReview);
      return {
        data: reviews,
        total: toNumber(objectData.total, reviews.length),
      };
    }
  } catch {
    // Ignore
  }

  return { data: [], total: 0 };
}

export async function updateReviewStatus(reviewId: string, status: string, headers?: HeadersInit): Promise<Review> {
  const data = await fetchCommerceApi<unknown>(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }, headers);
  return normalizeReview(data);
}

export async function deleteReview(reviewId: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
  }, headers);
}

export async function uploadImage(formData: FormData, headers?: HeadersInit): Promise<UploadResult> {
  const data = await fetchCommerceApi<unknown>("/api/upload/upload", {
    method: "POST",
    body: formData,
  }, headers);

  if (data && typeof data === "object") {
    const objectData = data as Record<string, unknown>;
    return {
      success: objectData.success === true,
      url: typeof objectData.url === "string" ? objectData.url : "",
      publicId: typeof objectData.publicId === "string" ? objectData.publicId : "",
      size: toNumber(objectData.size, 0),
    };
  }

  return { success: false, url: "", publicId: "", size: 0 };
}

export async function deleteImage(publicId: string, headers?: HeadersInit): Promise<unknown> {
  return fetchCommerceApi<unknown>("/api/upload/delete", {
    method: "DELETE",
    body: JSON.stringify({ publicId }),
  }, headers);
}
