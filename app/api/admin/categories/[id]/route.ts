import { NextResponse } from "next/server";
import { deleteCategory, updateCategory } from "@/lib/admin";
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
    const { name, description } = payload ?? {};

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid category name." }, { status: 400 });
    }

    const category = await updateCategory(
      params.id,
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
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await deleteCategory(params.id, request.headers);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete category." },
      { status: 500 }
    );
  }
}