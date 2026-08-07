import { NextResponse } from "next/server";
import { deleteCategory, updateCategory } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const { name, description } = payload ?? {};

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid category name." }, { status: 400 });
    }

    const category = await updateCategory(
      id,
      {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
      },
      request.headers
    );
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteCategory(id, request.headers);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete category." },
      { status: 500 }
    );
  }
}
