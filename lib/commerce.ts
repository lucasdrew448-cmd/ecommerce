import type { Product } from "@/lib/types";
export type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/products";

declare const process: {
  env: Record<string, string | undefined>;
};

async function fetchCommerceApi<T>(path: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL=https://discus-web-app-2-0.onrender.com/next-api;
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

export async function getProducts(): Promise<Product[]> {
  if (process.env.NEXT_PUBLIC_COMMERCE_API_URL) {
    try {
      return await fetchCommerceApi<Product[]>("/products");
    } catch {
      return FALLBACK_PRODUCTS;
    }
  }

  return FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (process.env.NEXT_PUBLIC_COMMERCE_API_URL) {
    try {
      const products = await fetchCommerceApi<Product[]>("/products");
      return products.find((product) => product.slug === slug);
    } catch {
      return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
    }
  }

  return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
}
