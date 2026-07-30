import { NextResponse } from "next/server";
import { createAdminCookie, verifyAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body ?? {};

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": createAdminCookie(),
      },
    }
  );
}
