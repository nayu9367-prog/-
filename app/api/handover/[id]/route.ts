import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deleteHandoverFile } from "@/lib/handover";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteHandoverFile(id);
  if (!deleted) {
    return NextResponse.json({ error: "해당 인계 자료를 찾을 수 없습니다." }, { status: 404 });
  }
  // The entry is already gone from the site; a file left behind in storage
  // is only reachable by someone who kept its link.
  try {
    await del(deleted.fileUrl);
  } catch (error) {
    console.error("인계 자료 파일 삭제 실패:", error);
  }
  return NextResponse.json({ success: true });
}
