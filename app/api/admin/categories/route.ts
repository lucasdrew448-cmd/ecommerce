import { NextResponse } from "next/server";
import { createCategory, listCategories } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const categories = await listCategories(request.headers);
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { name, description } = payload ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const category = await createCategory({ name: name.trim(), description: typeof description === "string" ? description : undefined }, request.headers);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create category." },
      { status: 500 }
    );
  }
}