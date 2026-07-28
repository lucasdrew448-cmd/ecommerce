import type { Product } from "./types";

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    slug: "essential-tracker",
    name: "Essential Tracker",
    description: "A modern smartwatch with activity tracking and fast checkout support.",
    price: 149.0,
    currency: "$",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
    ],
    details: ["24/7 fitness monitoring", "Phone notifications", "Long battery life"],
  },
  {
    id: "prod_002",
    slug: "artisan-everyday-bag",
    name: "Artisan Everyday Bag",
    description: "A premium leather bag built for daily commerce and seamless shipping.",
    price: 98.0,
    currency: "$",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80&auto=format&fit=crop",
    ],
    details: ["Vegetable-tanned leather", "Spacious interior", "Designed for travel"],
  },
  {
    id: "prod_003",
    slug: "comfort-sneaker",
    name: "Comfort Sneaker",
    description: "Lightweight sneakers designed for walking, running, and headless storefront demos.",
    price: 129.0,
    currency: "$",
    image: "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=1200&q=80&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80&auto=format&fit=crop",
    ],
    details: ["Breathable knit upper", "Cushioned midsole", "Water resistant"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
}
