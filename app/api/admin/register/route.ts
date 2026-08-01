import { NextResponse } from "next/server";
import { registerAdmin, setAdminCookieOnResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || typeof fullName !== "string") {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const result = await registerAdmin(email, password, fullName);
    const response = NextResponse.json({ success: true, result }, { status: 201 });
    setAdminCookieOnResponse(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register admin." },
      { status: 500 }
    );
  }
}
