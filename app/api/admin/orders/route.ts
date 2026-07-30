import { NextResponse } from "next/server";
import { listAdminOrders } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orders = await listAdminOrders(request.headers);
  return NextResponse.json(orders);
}
