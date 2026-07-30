import { NextResponse } from "next/server";
import { createAdminProduct, listAdminProducts } from "@/lib/admin";

export async function GET(request: Request) {
  const products = await listAdminProducts(request.headers);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const product = await createAdminProduct(payload, request.headers);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product." },
      { status: 500 }
    );
  }
}
