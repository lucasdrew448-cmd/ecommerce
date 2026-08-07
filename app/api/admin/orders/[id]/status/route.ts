import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const { status } = payload ?? {};

    if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await updateOrderStatus(id, status, request.headers);
    return NextResponse.json(result ?? { success: true, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order status." },
      { status: 500 }
    );
  }
}
