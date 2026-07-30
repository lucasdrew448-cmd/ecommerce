import type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/products";

declare const process: {
  env: Record<string, string | undefined>;
};

export type AdminProductInput = {
  id?: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  images?: string[];
  details?: string[];
};

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: string[];
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
  },
  {
    id: "ord_1002",
    customer: "Noah Chen",
    email: "noah@example.com",
    total: 129,
    status: "Shipped",
    createdAt: "2026-07-29",
    items: ["Comfort Sneaker"],
  },
];

let adminProductStore: Product[] = FALLBACK_PRODUCTS.map((product) => ({ ...product }));
let adminOrderStore: AdminOrder[] = FALLBACK_ORDERS.map((order) => ({ ...order }));

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";
}

function toProduct(input: AdminProductInput, existing?: Product): Product {
  const slug = input.slug || existing?.slug || createSlug(input.name);
  const id = input.id || existing?.id || `prod_${Date.now()}`;

  return {
    id,
    slug,
    name: input.name,
    description: input.description,
    price: Number.isFinite(input.price) ? input.price : 0,
    currency: input.currency || existing?.currency || "$",
    image: input.image || existing?.image,
    images: input.images || existing?.images,
    details: input.details || existing?.details || [],
  };
}

function normalizeProduct(item: unknown): Product {
  const product = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  const priceValue = product.price;
  const price = typeof priceValue === "number" ? priceValue : Number(priceValue ?? 0);

  return {
    id: typeof product.id === "string" ? product.id : String(product.slug ?? product.name ?? `prod_${Date.now()}`),
    slug: typeof product.slug === "string" ? product.slug : createSlug(typeof product.name === "string" ? product.name : "product"),
    name: typeof product.name === "string" ? product.name : "Untitled Product",
    description: typeof product.description === "string" ? product.description : "",
    price: Number.isFinite(price) ? price : 0,
    currency: typeof product.currency === "string" ? product.currency : "$",
    image: typeof product.image === "string" ? product.image : undefined,
    images: Array.isArray(product.images)
      ? (product.images as unknown[]).filter((value): value is string => typeof value === "string")
      : undefined,
    details: Array.isArray(product.details)
      ? (product.details as unknown[]).filter((value): value is string => typeof value === "string")
      : [],
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
    if (data && typeof data === "object" && "product" in objectData) {
      return [normalizeProduct(objectData.product)];
    }
  }

  return adminProductStore;
}

function normalizeOrder(item: unknown): AdminOrder {
  const order = (item && typeof item === "object" ? (item as Record<string, unknown>) : {}) as Record<string, unknown>;
  const totalValue = order.total;
  const total = typeof totalValue === "number" ? totalValue : Number(totalValue ?? 0);

  return {
    id: typeof order.id === "string" ? order.id : typeof order.order_id === "string" ? order.order_id : `ord_${Date.now()}`,
    customer: typeof order.customer === "string" ? order.customer : typeof order.customer_name === "string" ? order.customer_name : "Guest",
    email: typeof order.email === "string" ? order.email : "guest@example.com",
    total: Number.isFinite(total) ? total : 0,
    status: typeof order.status === "string" ? order.status : "Pending",
    createdAt: typeof order.createdAt === "string" ? order.createdAt : typeof order.created_at === "string" ? order.created_at : new Date().toISOString(),
    items: Array.isArray(order.items)
      ? (order.items as unknown[]).map((value) => (typeof value === "string" ? value : String(value ?? ""))).filter(Boolean)
      : [],
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

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {};

  if (!headers) {
    return normalized;
  }

  if (typeof (headers as { forEach?: unknown }).forEach === "function") {
    (headers as { forEach: (callback: (value: string, key: string) => void) => void }).forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (typeof (headers as { get?: unknown }).get === "function") {
    const cookieValue = (headers as { get: (name: string) => string | null }).get("cookie");
    if (cookieValue) {
      normalized.cookie = cookieValue;
    }
    return normalized;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      if (typeof value === "string") {
        normalized[key] = value;
      }
    });
    return normalized;
  }

  return Object.fromEntries(Object.entries(headers).filter(([, value]) => typeof value === "string")) as Record<string, string>;
}

async function fetchCommerceApi<T>(path: string, init?: RequestInit, forwardedHeaders?: HeadersInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL;
  if (!baseUrl) {
    throw new Error("Commerce API URL not configured.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...normalizeHeaders(init?.headers),
      ...normalizeHeaders(forwardedHeaders),
    },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed.`);
  }

  return response.json() as Promise<T>;
}

export async function listAdminProducts(headers?: HeadersInit): Promise<Product[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/next-api/products", undefined, headers);
    const products = normalizeProducts(data);
    adminProductStore = products;
    return products;
  } catch {
    return adminProductStore.map((product) => ({ ...product }));
  }
}

export async function createAdminProduct(input: AdminProductInput, headers?: HeadersInit): Promise<Product> {
  const product = toProduct(input);

  const data = await fetchCommerceApi<unknown>("/next-api/products", {
    method: "POST",
    body: JSON.stringify(product),
  }, headers);
  const normalizedProduct = normalizeProduct(data);
  adminProductStore = [normalizedProduct, ...adminProductStore.filter((item) => item.id !== normalizedProduct.id)];
  return normalizedProduct;
}

export async function updateAdminProduct(id: string, input: AdminProductInput, headers?: HeadersInit): Promise<Product> {
  const existingProduct = adminProductStore.find((product) => product.id === id || product.slug === id);
  const product = toProduct(input, existingProduct);

  const data = await fetchCommerceApi<unknown>(`/next-api/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(product),
  }, headers);
  const normalizedProduct = normalizeProduct(data);
  adminProductStore = adminProductStore.map((item) => (item.id === id || item.slug === id ? normalizedProduct : item));
  return normalizedProduct;
}

export async function deleteAdminProduct(id: string, headers?: HeadersInit): Promise<void> {
  await fetchCommerceApi<unknown>(`/next-api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }, headers);

  adminProductStore = adminProductStore.filter((product) => product.id !== id && product.slug !== id);
}

export async function listAdminOrders(headers?: HeadersInit): Promise<AdminOrder[]> {
  try {
    const data = await fetchCommerceApi<unknown>("/next-api/orders", undefined, headers);
    const orders = normalizeOrders(data);
    adminOrderStore = orders;
    return orders;
  } catch {
    return adminOrderStore.map((order) => ({ ...order }));
  }
}
