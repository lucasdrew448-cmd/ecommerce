import { NextResponse } from "next/server";
import { loginAdmin, setAdminCookieOnResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }

    await loginAdmin(email, password);

    const response = NextResponse.json({ success: true }, { status: 200 });
    setAdminCookieOnResponse(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to authenticate." },
      { status: 401 }
    );
  }
}
