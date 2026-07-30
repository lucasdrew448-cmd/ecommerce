import type { Product } from "@/lib/types";
export type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/products";

declare const process: {
  env: Record<string, string | undefined>;
};

async function fetchCommerceApi<T>(path: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL;
  if (!baseUrl) {
    throw new Error("Commerce API URL not configured.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch commerce API");
  }

  return response.json();
}

function normalizeProduct(item: unknown): Product {
  const product = (item && typeof item === "object") ? (item as Record<string, unknown>) : {};

  const slugValue =
    typeof product.slug === "string"
      ? product.slug
      : typeof product.id === "string"
      ? product.id
      : typeof product.name === "string"
      ? product.name
      : "unknown";

  const normalizedSlug = String(slugValue)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id: typeof product.id === "string" ? product.id : String(product.slug ?? product.name ?? "unknown"),
    slug: normalizedSlug || "unknown",
    name: typeof product.name === "string" ? product.name : "Untitled Product",
    description: typeof product.description === "string" ? product.description : "",
    price: typeof product.price === "number" && Number.isFinite(product.price) ? product.price : 0,
    currency: typeof product.currency === "string" ? product.currency : "$",
    image:
      typeof product.image === "string"
        ? product.image
        : typeof product.image_url === "string"
        ? product.image_url
        : typeof product.imageUrl === "string"
        ? product.imageUrl
        : undefined,
    image_url:
      typeof product.image_url === "string"
        ? product.image_url
        : typeof product.image === "string"
        ? product.image
        : typeof product.imageUrl === "string"
        ? product.imageUrl
        : undefined,
    imageUrl:
      typeof product.imageUrl === "string"
        ? product.imageUrl
        : typeof product.image_url === "string"
        ? product.image_url
        : typeof product.image === "string"
        ? product.image
        : undefined,
    additional_images: product.additional_images,
    images: (() => {
      const mainImage =
        typeof product.image === "string"
          ? product.image
          : typeof product.image_url === "string"
          ? product.image_url
          : typeof product.imageUrl === "string"
          ? product.imageUrl
          : undefined;

      const directImages = Array.isArray(product.images)
        ? (product.images as unknown[]).filter((value): value is string => typeof value === "string")
        : [];

      const additionalImagesValue = product.additional_images;
      const additionalImages = (() => {
        if (Array.isArray(additionalImagesValue)) {
          return additionalImagesValue.filter((value): value is string => typeof value === "string");
        }

        if (typeof additionalImagesValue === "string") {
          return [additionalImagesValue];
        }

        if (additionalImagesValue && typeof additionalImagesValue === "object") {
          const nested = additionalImagesValue as Record<string, unknown>;

          if (Array.isArray(nested.images)) {
            return nested.images.filter((value): value is string => typeof value === "string");
          }

          if (Array.isArray(nested.urls)) {
            return nested.urls.filter((value): value is string => typeof value === "string");
          }

          if (typeof nested.url === "string") {
            return [nested.url];
          }

          const objectValues = Object.values(nested).filter((value): value is string => typeof value === "string");
          if (objectValues.length) {
            return objectValues;
          }
        }

        return [];
      })();

      const orderedImages = [mainImage, ...directImages, ...additionalImages].filter(
        (value): value is string => typeof value === "string" && value.length > 0
      );

      return orderedImages.length ? orderedImages : undefined;
    })(),
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
  }

  return FALLBACK_PRODUCTS;
}

export async function getProducts(): Promise<Product[]> {
  if (process.env.NEXT_PUBLIC_COMMERCE_API_URL) {
    try {
      const data = await fetchCommerceApi<unknown>("/products");
      return normalizeProducts(data);
    } catch {
      return FALLBACK_PRODUCTS;
    }
  }

  return FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const normalizedSlug = String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (process.env.NEXT_PUBLIC_COMMERCE_API_URL) {
    try {
      const data = await fetchCommerceApi<unknown>(`/products?slug=${encodeURIComponent(slug)}`);
      const products = normalizeProducts(data);
      return products.find((product) => product.slug === normalizedSlug);
    } catch {
      return FALLBACK_PRODUCTS.find((product) => product.slug === normalizedSlug);
    }
  }

  return FALLBACK_PRODUCTS.find((product) => product.slug === normalizedSlug);
}
