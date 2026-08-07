import { NextResponse } from "next/server";
import { createHeroBanner, listHeroBanners } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const banners = await listHeroBanners(request.headers);
  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { url, title, description } = payload ?? {};

    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Banner URL is required." }, { status: 400 });
    }

    const banner = await createHeroBanner(
      {
        url: url.trim(),
        title: typeof title === "string" ? title : undefined,
        description: typeof description === "string" ? description : undefined,
      },
      request.headers
    );
    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create banner." },
      { status: 500 }
    );
  }
}