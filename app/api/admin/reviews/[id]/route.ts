import { NextResponse } from "next/server";
import { deleteReview, updateReviewStatus } from "@/lib/admin";
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
    const { status } = payload ?? {};

    if (typeof status !== "string" || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid review status." }, { status: 400 });
    }

    const review = await updateReviewStatus(id, status, request.headers);
    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update review." },
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
    await deleteReview(id, request.headers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete review." },
      { status: 500 }
    );
  }
}
