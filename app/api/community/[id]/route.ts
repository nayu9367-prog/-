import { NextRequest, NextResponse } from "next/server";
import { deleteCommunityPost } from "@/lib/community";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteCommunityPost(id);
  if (!deleted) {
    return NextResponse.json({ error: "해당 게시글을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
