import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_PRODUCTS } from "@/lib/products";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const product = FALLBACK_PRODUCTS.find((item) => item.slug === slug);
    if (!product) {
      return new NextResponse(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.json(product);
  }

  return NextResponse.json(FALLBACK_PRODUCTS);
}
