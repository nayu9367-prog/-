import { NextRequest, NextResponse } from "next/server";
import { createQuizQuestions } from "@/lib/quiz";
import { MAX_IMPORT_QUESTIONS, normalizeQuizQuestionInput } from "@/lib/quizImport";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const items: unknown[] = Array.isArray(body?.questions) ? body.questions : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "등록할 문제가 없습니다." }, { status: 400 });
  }
  if (items.length > MAX_IMPORT_QUESTIONS) {
    return NextResponse.json(
      { error: `한 번에 최대 ${MAX_IMPORT_QUESTIONS}문제까지 등록할 수 있습니다.` },
      { status: 400 }
    );
  }

  const inputs = items.map(normalizeQuizQuestionInput);
  const invalidIdx = inputs.findIndex((input) => input === null);
  if (invalidIdx !== -1) {
    return NextResponse.json(
      { error: `${invalidIdx + 1}번째 문제의 질문, 보기(2개 이상), 정답, 해설을 확인해주세요.` },
      { status: 400 }
    );
  }

  const questions = await createQuizQuestions(inputs.filter((input) => input !== null));
  return NextResponse.json({ questions }, { status: 201 });
}
