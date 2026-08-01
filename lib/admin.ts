import type { Category, HeroBanner, Order, Product, ProductType, Review, Supplier, UploadResult } from "@/lib/types";
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
  category_id?: string;
  product_type_id?: string;
  supplier_id?: string;
  stock?: number;
  additional_images?: string[];
  sizes?: string[];
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

function getApiBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_COMMERCE_API_URL || null;
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
  const slug = input.slug || existing?.slug || createSlug(input.name);
  const id = input.id || existing?.id || `prod_${Date.now()}`;

  const mainImage =
    input.image ||
    existing?.image ||
    (typeof input.images?.[0] === "string" ? input.images[0] : undefined);

  const allImages = [mainImage, ...(input.images ?? []), ...(input.additional_images ?? [])].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

  return {
    id,
    slug,
    name: input.name,
    description: input.description,
    price: Number.isFinite(input.price) ? input.price : 0,
    currency: input.currency || existing?.currency || "$",
    image: mainImage,
    images: allImages.length ? allImages : existing?.images,
    details: input.details || existing?.details || [],
    category_id: input.category_id || existing?.category_id,
    product_type_id: input.product_type_id || existing?.product_type_id,
    supplier_id: input.supplier_id || existing?.supplier_id,
    stock: input.stock ?? existing?.stock,
    additional_images: input.additional_images ? JSON.stringify(input.additional_images) : existing?.additional_images,
    sizes: input.sizes ? JSON.stringify(input.sizes) : existing?.sizes,
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
    images: orderedImages.length ? orderedImages : undefined,
    details: Array.isArray(product.details)
      ? (product.details as unknown[]).filter((value): value is string => typeof value === "string")
      : [],
    category_id: typeof product.category_id === "string" ? product.category_id : undefined,
    product_type_id: typeof product.product_type_id === "string" ? product.product_type_id : undefined,
    supplier_id: typeof product.supplier_id === "string" ? product.supplier_id : undefined,
    stock: typeof product.stock === "number" ? product.stock : undefined,
    additional_images: typeof product.additional_images === "string" ? product.additional_images : undefined,
    sizes: typeof product.sizes === "string" ? product.sizes : undefined,
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

  const orderItems = Array.isArray(order.order_items)
    ? (order.order_items as unknown[]).map((value) => {
        if (typeof value === "string") return value;
        if (value && typeof value === "object") {
          const obj = value as Record<string, unknown>;
          return typeof obj.product_name === "string"
            ? obj.product_name
            : typeof obj.name === "string"
              ? obj.name
              : String(obj.product_id ?? "");
        }
        return String(value ?? "");
      }).filter(Boolean)
    : [];

  return {
    id: typeof order.id === "string" ? order.id : typeof order.order_id === "string" ? order.order_id : `ord_${Date.now()}`,
    customer: typeof order.customer_name === "string" ? order.customer_name : "Guest",
    email: typeof order.customer_email === "string" ? order.customer_email : "guest@example.com",
    total: Number.isFinite(total) ? total : 0,
    status: typeof order.status === "string" ? order.status : "Pending",
    createdAt: typeof order.created_at === "string" ? order.created_at : new Date().toISOString(),
    items: orderItems,
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
    const authValue = (headers as { get: (name: string) => string | null }).get("authorization");
    if (authValue) {
      normalized.authorization = authValue;
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
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("Commerce API URL not configured.");
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = normalizedBase.includes("/api") && normalizedPath.startsWith("/api")
    ? `${normalizedBase}${normalizedPath.replace("/api", "")}`
    : `${normalizedBase}${normalizedPath}`;

  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      ...normalizeHeaders(init?.headers),
      ...normalizeHeaders(forwardedHeaders),
      ...(init?.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
    },
  });

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

export async function createAdminProduct(input: AdminProductInput, headers?: HeadersInit): Promise<Product> {
  const product = toProduct(input);

  const data = await fetchCommerceApi<unknown>("/api/products", {
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

  const data = await fetchCommerceApi<unknown>(`/api/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(product),
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