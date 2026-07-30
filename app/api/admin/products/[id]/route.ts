import { NextResponse } from "next/server";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const payload = await request.json();
  const product = await updateAdminProduct(params.id, payload, request.headers);
  return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  await deleteAdminProduct(params.id, request.headers);
  return NextResponse.json({ success: true });
}
