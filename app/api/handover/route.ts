import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createHandoverFile } from "@/lib/handover";
import { MAX_HANDOVER_FILE_MB } from "@/lib/handoverData";
import { sanitizeFileName } from "@/lib/uploads";

const PDF_ONLY = "PDF 파일만 올릴 수 있습니다.";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Students upload here, so the file is checked by what it contains as well
// as by its name: every PDF starts with "%PDF-".
async function isPdf(file: File): Promise<boolean> {
  if (!file.name.toLowerCase().endsWith(".pdf")) return false;
  if (file.type && file.type !== "application/pdf" && file.type !== "application/octet-stream") return false;
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const institution = text(formData?.get("institution"), 60);
  const period = text(formData?.get("period"), 60);
  const file = formData?.get("file");

  if (!institution || !period) {
    return NextResponse.json({ error: "실습기관과 실습 시기·조를 모두 입력해주세요." }, { status: 400 });
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "PDF 파일을 첨부해주세요." }, { status: 400 });
  }
  if (file.size > MAX_HANDOVER_FILE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `파일 크기는 ${MAX_HANDOVER_FILE_MB}MB 이하만 올릴 수 있습니다.` },
      { status: 400 }
    );
  }
  if (!(await isPdf(file))) {
    return NextResponse.json({ error: PDF_ONLY }, { status: 400 });
  }

  const fileName = sanitizeFileName(file.name);
  let fileUrl: string;
  try {
    const blob = await put(`handover/${Date.now()}-${fileName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/pdf",
    });
    fileUrl = blob.url;
  } catch (error) {
    console.error("인계 자료 업로드 실패:", error);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 502 });
  }

  const saved = await createHandoverFile({ institution, period, fileUrl, fileName });
  return NextResponse.json({ file: saved }, { status: 201 });
}
