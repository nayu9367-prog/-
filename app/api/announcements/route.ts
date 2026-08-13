import { NextRequest, NextResponse } from "next/server";
import { createAnnouncement, getAnnouncements } from "@/lib/data";

export async function GET() {
  const announcements = await getAnnouncements();
  return NextResponse.json({ announcements });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!title || !content) {
    return NextResponse.json(
      { error: "제목과 내용을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  const announcement = await createAnnouncement({ title, content });
  return NextResponse.json({ announcement }, { status: 201 });
}
