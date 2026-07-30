import { NextResponse } from "next/server";
import { listAdminOrders } from "@/lib/admin";

export async function GET() {
  const orders = await listAdminOrders();
  return NextResponse.json(orders);
}
