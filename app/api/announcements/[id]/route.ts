import { NextRequest, NextResponse } from "next/server";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/data";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!title || !content) {
    return NextResponse.json(
      { error: "제목과 내용을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  const announcement = await updateAnnouncement(id, { title, content });
  if (!announcement) {
    return NextResponse.json(
      { error: "해당 공지사항을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ announcement });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteAnnouncement(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "해당 공지사항을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
