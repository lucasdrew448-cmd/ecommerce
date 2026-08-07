import { NextResponse } from "next/server";
import { createProductType, listProductTypes } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const productTypes = await listProductTypes(request.headers);
  return NextResponse.json(productTypes);
}

export async function POST(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { name, description } = payload ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Product type name is required." }, { status: 400 });
    }

    const productType = await createProductType(
      { name: name.trim(), description: typeof description === "string" ? description : undefined },
      request.headers
    );
    return NextResponse.json(productType, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product type." },
      { status: 500 }
    );
  }
}