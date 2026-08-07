import { NextResponse } from "next/server";
import { listAdminReviews } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;

  const reviews = await listAdminReviews(
    {
      product_id: productId,
      status,
      limit: Number.isFinite(limit) ? limit : undefined,
      offset: Number.isFinite(offset) ? offset : undefined,
    },
    request.headers
  );
  return NextResponse.json(reviews);
}