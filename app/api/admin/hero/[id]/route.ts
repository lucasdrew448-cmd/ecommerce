import { NextResponse } from "next/server";
import { deleteHeroBanner, updateHeroBanner } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { url, title, description } = payload ?? {};

    const banner = await updateHeroBanner(
      params.id,
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
  if (!verifyAdminTokenFromHeaders(request.headers)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await deleteHeroBanner(params.id, request.headers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete banner." },
      { status: 500 }
    );
  }
}