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

  return {
    id: typeof product.id === "string" ? product.id : String(product.slug ?? product.name ?? "unknown"),
    slug: typeof product.slug === "string" ? product.slug : String(product.id ?? product.name ?? "unknown"),
    name: typeof product.name === "string" ? product.name : "Untitled Product",
    description: typeof product.description === "string" ? product.description : "",
    price: typeof product.price === "number" && Number.isFinite(product.price) ? product.price : 0,
    currency: typeof product.currency === "string" ? product.currency : "$",
    image: (() => {
      const resolveImageValue = (value: unknown): string | undefined => {
        if (typeof value === "string") {
          return value;
        }

        if (value && typeof value === "object") {
          const obj = value as Record<string, unknown>;
          if (typeof obj.image === "string") {
            return obj.image;
          }
          if (typeof obj.image_url === "string") {
            return obj.image_url;
          }
          if (typeof obj.imageUrl === "string") {
            return obj.imageUrl;
          }
          if (typeof obj.url === "string") {
            return obj.url;
          }
          return undefined;
        }

        return undefined;
      };

      return (
        resolveImageValue(product.image) ??
        resolveImageValue(product.image_url) ??
        resolveImageValue(product.imageUrl)
      );
    })(),
    images: (() => {
      const parseJson = (value: string) => {
        try {
          return JSON.parse(value) as unknown;
        } catch {
          return value;
        }
      };

      const resolveImageValue = (value: unknown): string | undefined => {
        if (typeof value === "string") {
          return value;
        }

        if (value && typeof value === "object") {
          const obj = value as Record<string, unknown>;
          if (typeof obj.image === "string") {
            return obj.image;
          }
          if (typeof obj.image_url === "string") {
            return obj.image_url;
          }
          if (typeof obj.imageUrl === "string") {
            return obj.imageUrl;
          }
          if (typeof obj.url === "string") {
            return obj.url;
          }
          return undefined;
        }

        return undefined;
      };

      const normalizeImageArray = (value: unknown): string[] => {
        if (Array.isArray(value)) {
          return value
            .map(resolveImageValue)
            .filter((src): src is string => typeof src === "string" && src.length > 0);
        }

        if (typeof value === "string") {
          const parsed = parseJson(value);
          if (Array.isArray(parsed)) {
            return normalizeImageArray(parsed);
          }

          const resolved = resolveImageValue(parsed);
          return resolved ? [resolved] : [value];
        }

        if (value && typeof value === "object") {
          const obj = value as Record<string, unknown>;

          if (Array.isArray(obj.images)) {
            return normalizeImageArray(obj.images);
          }

          if (Array.isArray(obj.urls)) {
            return normalizeImageArray(obj.urls);
          }

          const resolved = resolveImageValue(obj);
          if (resolved) {
            return [resolved];
          }

          return Object.values(obj).flatMap(normalizeImageArray);
        }

        return [];
      };

      const mainImage =
        resolveImageValue(product.image) ??
        resolveImageValue(product.image_url) ??
        resolveImageValue(product.imageUrl);

      const directImages = normalizeImageArray(product.images);
      const additionalImages = normalizeImageArray(product.additional_images);

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
  if (process.env.NEXT_PUBLIC_COMMERCE_API_URL) {
    try {
      const data = await fetchCommerceApi<unknown>(`/products?slug=${encodeURIComponent(slug)}`);
      const products = normalizeProducts(data);
      return products.find((product) => product.slug === slug);
    } catch {
      return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
    }
  }

  return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
}
