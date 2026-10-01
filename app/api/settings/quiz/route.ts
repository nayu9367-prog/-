import { NextRequest, NextResponse } from "next/server";
import {
  MAX_QUIZ_QUESTION_COUNT,
  MIN_QUIZ_QUESTION_COUNT,
  updateQuizSettings,
} from "@/lib/quizSettings";

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const questionCount = Number.isInteger(body?.questionCount) ? (body.questionCount as number) : NaN;

  if (!(questionCount >= MIN_QUIZ_QUESTION_COUNT && questionCount <= MAX_QUIZ_QUESTION_COUNT)) {
    return NextResponse.json(
      {
        error: `출제 문제 수는 ${MIN_QUIZ_QUESTION_COUNT}~${MAX_QUIZ_QUESTION_COUNT} 사이의 숫자로 입력해주세요.`,
      },
      { status: 400 }
    );
  }

  const settings = await updateQuizSettings({ questionCount });
  return NextResponse.json({ settings });
}
