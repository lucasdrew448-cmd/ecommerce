import { NextResponse } from "next/server";
import { resendOrderConfirmation } from "@/lib/commerce";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const result = await resendOrderConfirmation(params.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resend confirmation email." },
      { status: 500 }
    );
  }
}