import { NextResponse } from "next/server";
import { clearAdminCookieOnResponse } from "@/lib/auth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  clearAdminCookieOnResponse(response);
  return response;
}
