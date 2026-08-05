import { NextResponse } from "next/server";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin";
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
    const product = await updateAdminProduct(id, payload, request.headers);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
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
    await deleteAdminProduct(id, request.headers);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete product." },
      { status: 500 }
    );
  }
}
