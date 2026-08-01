import { NextResponse } from "next/server";
import { deleteSupplier, updateSupplier } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const supplier = await updateSupplier(params.id, payload ?? {}, request.headers);
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update supplier." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await deleteSupplier(params.id, request.headers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete supplier." },
      { status: 500 }
    );
  }
}