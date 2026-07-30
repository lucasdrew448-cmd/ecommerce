import { NextResponse } from "next/server";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const payload = await request.json();
  const product = await updateAdminProduct(params.id, payload);
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  await deleteAdminProduct(params.id);
  return NextResponse.json({ success: true });
}
