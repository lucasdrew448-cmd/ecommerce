import { NextResponse } from "next/server";
import { createAdminProduct, listAdminProducts } from "@/lib/admin";

export async function GET() {
  const products = await listAdminProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const product = await createAdminProduct(payload);
  return NextResponse.json(product, { status: 201 });
}
