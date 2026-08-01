import { NextResponse } from "next/server";
import { sendPaymentStatusEmail } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { paymentStatus } = payload ?? {};

    if (typeof paymentStatus !== "string" || !["successful", "unsuccessful"].includes(paymentStatus)) {
      return NextResponse.json(
        { error: "paymentStatus must be 'successful' or 'unsuccessful'." },
        { status: 400 }
      );
    }

    const result = await sendPaymentStatusEmail(params.id, paymentStatus, request.headers);
    return NextResponse.json(result ?? { success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send payment status email." },
      { status: 500 }
    );
  }
}