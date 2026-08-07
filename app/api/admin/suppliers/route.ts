import { NextResponse } from "next/server";
import { createSupplier, listSuppliers } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const suppliers = await listSuppliers(request.headers);
  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { name } = payload ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Supplier name is required." }, { status: 400 });
    }

    const supplier = await createSupplier(payload, request.headers);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create supplier." },
      { status: 500 }
    );
  }
}