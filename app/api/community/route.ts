import { NextRequest, NextResponse } from "next/server";
import { createCommunityPost, getCommunityPosts } from "@/lib/community";

export async function GET() {
  const posts = await getCommunityPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const postBody = typeof body?.body === "string" ? body.body.trim() : "";
  const authorName = typeof body?.authorName === "string" ? body.authorName.trim() : "";

  if (!category || !title || !postBody || !authorName) {
    return NextResponse.json(
      { error: "카테고리, 제목, 내용, 작성자를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  const post = await createCommunityPost({ category, title, body: postBody, authorName });
  return NextResponse.json({ post }, { status: 201 });
}
