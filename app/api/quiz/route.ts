import { NextRequest, NextResponse } from "next/server";
import { createQuizQuestion, getQuizQuestions } from "@/lib/quiz";
import { normalizeQuizQuestionInput } from "@/lib/quizImport";

export async function GET() {
  const questions = await getQuizQuestions();
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const input = normalizeQuizQuestionInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "질문과 해설을 입력하고, 객관식은 보기(2개 이상)와 정답을 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  const created = await createQuizQuestion(input);
  return NextResponse.json({ question: created }, { status: 201 });
}
