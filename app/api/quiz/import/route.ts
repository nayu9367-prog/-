import { NextRequest, NextResponse } from "next/server";
import {
  extractQuizQuestionsFromPdf,
  MAX_IMPORT_PDF_MB,
  QuizImportError,
} from "@/lib/quizImport";

// Reading a ~50-question PDF takes the model well over the default limit
// on serverless hosts.
export const maxDuration = 300;

// Extracts questions from an uploaded PDF for the admin to review. Nothing
// is saved here — the reviewed list is saved through /api/quiz/bulk.
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "PDF 파일을 첨부해주세요." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF 파일만 올릴 수 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_IMPORT_PDF_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `파일 크기는 ${MAX_IMPORT_PDF_MB}MB 이하만 올릴 수 있습니다.` },
      { status: 400 }
    );
  }

  try {
    const result = await extractQuizQuestionsFromPdf(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof QuizImportError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error("퀴즈 PDF 읽기 실패:", error);
    return NextResponse.json({ error: "PDF를 읽는 중 오류가 발생했습니다." }, { status: 502 });
  }
}
