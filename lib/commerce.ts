import type { Product } from "@/lib/types";
export type { Product } from "@/lib/types";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    slug: "essential-tracker",
    name: "Essential Tracker",
    description: "A modern smartwatch with activity tracking and fast checkout support.",
    price: 149.0,
    currency: "$",
    details: ["24/7 fitness monitoring", "Phone notifications", "Long battery life"],
  },
  {
    id: "prod_002",
    slug: "artisan-everyday-bag",
    name: "Artisan Everyday Bag",
    description: "A premium leather bag built for daily commerce and seamless shipping.",
    price: 98.0,
    currency: "$",
    details: ["Vegetable-tanned leather", "Spacious interior", "Designed for travel"],
  },
  {
    id: "prod_003",
    slug: "comfort-sneaker",
    name: "Comfort Sneaker",
    description: "Lightweight sneakers designed for walking, running, and headless storefront demos.",
    price: 129.0,
    currency: "$",
    details: ["Breathable knit upper", "Cushioned midsole", "Water resistant"],
  },
];

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
