import { NextResponse } from "next/server";
import { FALLBACK_PRODUCTS } from "@/lib/products";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const product = FALLBACK_PRODUCTS.find((item) => item.slug === slug);

  if (!product) {
    return new NextResponse(JSON.stringify({ error: "Product not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return NextResponse.json(product);
}
