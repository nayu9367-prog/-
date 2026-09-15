import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "파일을 첨부해주세요." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "파일 크기는 20MB 이하만 업로드할 수 있습니다." }, { status: 400 });
  }

  try {
    const blob = await put(`resources/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url, fileName: file.name });
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 502 });
  }
}
