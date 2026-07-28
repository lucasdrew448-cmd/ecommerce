import { NextResponse } from "next/server";
import { FALLBACK_PRODUCTS } from "@/lib/products";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const product = FALLBACK_PRODUCTS.find((item) => item.slug === params.slug);

  if (!product) {
    return new NextResponse(JSON.stringify({ error: "Product not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return NextResponse.json(product);
}
