import { NextResponse } from "next/server";
import { deleteProductType, updateProductType } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const { name, description } = payload ?? {};

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid product type name." }, { status: 400 });
    }

    const productType = await updateProductType(
      id,
      {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
      },
      request.headers
    );
    return NextResponse.json(productType);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product type." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteProductType(id, request.headers);
    return NextResponse.json({ message: "Product type deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete product type." },
      { status: 500 }
    );
  }
}
