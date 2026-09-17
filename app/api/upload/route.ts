import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Practice templates/resources are documents, spreadsheets, slides, or
// images — never anything executable.
const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "hwp",
  "hwpx",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/x-hwp",
  "application/haansofthwp",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  // Browsers often can't infer a MIME type for less common formats (hwp, etc.)
  // and fall back to this; the extension check above still applies.
  "application/octet-stream",
]);

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").slice(-150);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "파일을 첨부해주세요." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "파일 크기는 20MB 이하만 업로드할 수 있습니다." }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      { error: "허용되지 않는 파일 형식입니다. (문서·엑셀·PPT·이미지 파일만 업로드할 수 있습니다.)" },
      { status: 400 }
    );
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "허용되지 않는 파일 형식입니다. (문서·엑셀·PPT·이미지 파일만 업로드할 수 있습니다.)" },
      { status: 400 }
    );
  }

  const safeName = sanitizeFileName(file.name);

  try {
    const blob = await put(`resources/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url, fileName: safeName });
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 502 });
  }
}
