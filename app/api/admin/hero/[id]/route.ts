import { NextResponse } from "next/server";
import { deleteHeroBanner, updateHeroBanner } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const { url, title, description } = payload ?? {};

    const banner = await updateHeroBanner(
      id,
      {
        url: url !== undefined ? url : undefined,
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
      },
      request.headers
    );
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update banner." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!(await verifyAdminTokenFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteHeroBanner(id, request.headers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete banner." },
      { status: 500 }
    );
  }
}
