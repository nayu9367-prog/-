import { NextRequest, NextResponse } from "next/server";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/data";
import { isUploadedFileUrl } from "@/lib/uploads";

type RouteContext = { params: Promise<{ id: string }> };

// Returns null when a file URL is present but isn't one of our uploads.
function parseAttachment(body: unknown): { fileUrl?: string; fileName?: string } | null {
  const rec = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const fileUrl = typeof rec.fileUrl === "string" ? rec.fileUrl.trim() : "";
  const fileName = typeof rec.fileName === "string" ? rec.fileName.trim().slice(0, 150) : "";
  if (!fileUrl) return {};
  if (!isUploadedFileUrl(fileUrl)) return null;
  return { fileUrl, fileName: fileName || "첨부파일" };
}

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

  const attachment = parseAttachment(body);
  if (!attachment) {
    return NextResponse.json({ error: "첨부 파일을 다시 올려주세요." }, { status: 400 });
  }

  const announcement = await updateAnnouncement(id, { title, content, ...attachment });
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
