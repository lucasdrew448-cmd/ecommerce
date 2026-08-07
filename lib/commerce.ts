import type { Category, HeroBanner, Order, OrderInput, OrderItem, Product, ProductType, Review, Supplier } from "@/lib/types";
export type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/products";

declare const process: {
  env: Record<string, string | undefined>;
};

const API_BASE_PATH = "/api";
const DEFAULT_COMMERCE_API_URL = "https://www.charlesdiscus.website/api";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_COMMERCE_API_URL || process.env.COMMERCE_API_URL || DEFAULT_COMMERCE_API_URL;
}

async function fetchCommerceApi<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = normalizedBase.includes("/api") && normalizedPath.startsWith(API_BASE_PATH)
    ? `${normalizedBase}${normalizedPath.replace(API_BASE_PATH, "")}`
    : `${normalizedBase}${normalizedPath}`;

  // Use manual redirect handling so we can re-issue the request with the
  // same method and body to the redirected URL. Node's fetch converts
  // POST → GET on 301/302 redirects, which would drop the body and cause
  // a 500 error.
  const redirect = "manual" as const;

  let response = await fetch(url, {
    cache: "no-store",
    ...init,
    redirect,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  // Handle redirects manually to preserve the HTTP method and body.
  let currentUrl = url;
  let currentResponse = response;
  let redirectCount = 0;
  while (currentResponse.status >= 300 && currentResponse.status < 400 && redirectCount < 5) {
    const location = currentResponse.headers.get("location");
    if (!location) break;
    currentUrl = new URL(location, currentUrl).toString();
    currentResponse = await fetch(currentUrl, {
      cache: "no-store",
      ...init,
      redirect,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    redirectCount += 1;
  }
  response = currentResponse;

  if (!response.ok) {
    throw new Error(`Request to ${path} failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
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
 * string. This preserves `additional_images` and `sizes` fields when the
 * upstream API returns them as arrays rather than pre-encoded strings.
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

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";
}

function normalizeProduct(item: unknown): Product {
  const product = (item && typeof item === "object") ? (item as Record<string, unknown>) : {};

  const name = typeof product.name === "string" ? product.name : "Untitled Product";
  const mainImage =
    resolveImageValue(product.image) ??
    resolveImageValue(product.image_url) ??
    resolveImageValue(product.imageUrl);
  const directImages = normalizeImageArray(product.images);
  const additionalImages = normalizeImageArray(product.additional_images);
  const orderedImages = [mainImage, ...directImages, ...additionalImages].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );
  return {
    id: typeof product.id === "string" ? product.id : String(product.slug ?? name ?? "unknown"),
    slug: typeof product.slug === "string" ? product.slug : createSlug(name),
    name,
    description: typeof product.description === "string" ? product.description : "",
    price: toNumber(product.price, 0),
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

  return FALLBACK_PRODUCTS;
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

function normalizeOrderItem(item: unknown): OrderItem {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  return {
    id: typeof value.id === "string" ? value.id : undefined,
    order_id: typeof value.order_id === "string" ? value.order_id : undefined,
    product_id: typeof value.product_id === "string" ? value.product_id : "",
    quantity: toNumber(value.quantity, 1),
    price: toNumber(value.price, 0),
  };
}

function normalizeOrder(item: unknown): Order {
  const value = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;

  return {
    id: typeof value.id === "string" ? value.id : String(value.order_id ?? "unknown"),
    customer_email: typeof value.customer_email === "string" ? value.customer_email : undefined,
    customer_name: typeof value.customer_name === "string" ? value.customer_name : undefined,
    shipping_address: typeof value.shipping_address === "string" ? value.shipping_address : undefined,
    shipping_destination: typeof value.shipping_destination === "string" ? value.shipping_destination : undefined,
    shipping_method: typeof value.shipping_method === "string" ? value.shipping_method : undefined,
    shipping_cost: toNumber(value.shipping_cost, 0),
    total_price: toNumber(value.total_price ?? value.total, 0),
    status: typeof value.status === "string" ? value.status : "pending",
    ip_address: typeof value.ip_address === "string" ? value.ip_address : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
    order_items: Array.isArray(value.order_items) ? value.order_items.map(normalizeOrderItem) : undefined,
  };
}

export async function getProducts(params?: { category_id?: string; search?: string }): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category_id) query.set("category_id", params.category_id);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    const data = await fetchCommerceApi<unknown>(`/products${qs ? `?${qs}` : ""}`);
    return normalizeProducts(data);
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const data = await fetchCommerceApi<unknown>(`/products?slug=${encodeURIComponent(slug)}`);
    const products = normalizeProducts(data);
    return products.find((product) => product.slug === slug);
  } catch {
    return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const data = await fetchCommerceApi<unknown>(`/products/${encodeURIComponent(id)}`);
    const products = normalizeProducts(data);
    return products[0];
  } catch {
    return FALLBACK_PRODUCTS.find((product) => product.id === id);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/categories");
    return normalizeArray(data, normalizeCategory);
  } catch {
    return [];
  }
}

export async function getProductTypes(): Promise<ProductType[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/product-types");
    return normalizeArray(data, normalizeProductType);
  } catch {
    return [];
  }
}

export async function getSuppliers(params?: { search?: string; status?: string }): Promise<Supplier[]> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);

    const qs = query.toString();
    const data = await fetchCommerceApi<unknown>(`/suppliers${qs ? `?${qs}` : ""}`);
    return normalizeArray(data, normalizeSupplier);
  } catch {
    return [];
  }
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/hero");
    return normalizeArray(data, normalizeHeroBanner);
  } catch {
    return [];
  }
}

export async function getStoreReviews(params?: { limit?: number; offset?: number }): Promise<{
  data: Review[];
  averageRating: string;
  total: number;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    const data = await fetchCommerceApi<unknown>(`/reviews/store${qs ? `?${qs}` : ""}`);

    if (data && typeof data === "object") {
      const objectData = data as Record<string, unknown>;
      const reviews = normalizeArray(objectData.data ?? objectData.reviews, normalizeReview);
      return {
        data: reviews,
        averageRating: typeof objectData.averageRating === "string" ? objectData.averageRating : "0",
        total: toNumber(objectData.total, reviews.length),
      };
    }
  } catch {
    // Ignore and return empty
  }

  return { data: [], averageRating: "0", total: 0 };
}

export async function getProductReviews(productId: string, params?: { limit?: number; offset?: number }): Promise<{
  data: Review[];
  averageRating: string;
  total: number;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    const data = await fetchCommerceApi<unknown>(`/reviews/product/${encodeURIComponent(productId)}${qs ? `?${qs}` : ""}`);

    if (data && typeof data === "object") {
      const objectData = data as Record<string, unknown>;
      const reviews = normalizeArray(objectData.data ?? objectData.reviews, normalizeReview);
      return {
        data: reviews,
        averageRating: typeof objectData.averageRating === "string" ? objectData.averageRating : "0",
        total: toNumber(objectData.total, reviews.length),
      };
    }
  } catch {
    // Ignore and return empty
  }

  return { data: [], averageRating: "0", total: 0 };
}

export async function placeOrder(orderInput: OrderInput): Promise<Order> {
  const data = await fetchCommerceApi<unknown>("/orders", {
    method: "POST",
    body: JSON.stringify(orderInput),
  });
  return normalizeOrder(data);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  try {
    const data = await fetchCommerceApi<unknown>(`/orders/${encodeURIComponent(id)}`);
    return normalizeOrder(data);
  } catch {
    return undefined;
  }
}

export async function getHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    const data = await fetchCommerceApi<unknown>("/health");
    if (data && typeof data === "object") {
      const objectData = data as Record<string, unknown>;
      return {
        status: typeof objectData.status === "string" ? objectData.status : "unknown",
        timestamp: typeof objectData.timestamp === "string" ? objectData.timestamp : new Date().toISOString(),
      };
    }
  } catch {
    // Ignore
  }

  return { status: "unknown", timestamp: new Date().toISOString() };
}