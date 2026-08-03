import { NextResponse } from "next/server";
import { deleteImage, uploadImage } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const result = await uploadImage(formData, request.headers);
    if (!result.success) {
      return NextResponse.json({ error: "Upload failed." }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/admin/upload] image upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { publicId } = payload ?? {};

    if (typeof publicId !== "string" || !publicId.trim()) {
      return NextResponse.json({ error: "publicId is required." }, { status: 400 });
    }

    const result = await deleteImage(publicId, request.headers);
    return NextResponse.json(result ?? { success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete image." },
      { status: 500 }
    );
  }
}