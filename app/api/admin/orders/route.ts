import { NextResponse } from "next/server";
import { listAdminOrders } from "@/lib/admin";

export async function GET(request: Request) {
  const orders = await listAdminOrders(request.headers);
  return NextResponse.json(orders);
}
