import { NextRequest, NextResponse } from "next/server";
import { createQuizQuestion, getQuizQuestions } from "@/lib/quiz";

function parseOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET() {
  const questions = await getQuizQuestions();
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const options = parseOptions(body?.options);
  const answer = Number.isInteger(body?.answer) ? (body.answer as number) : -1;
  const explanation = typeof body?.explanation === "string" ? body.explanation.trim() : "";

  if (!question || options.length < 2 || answer < 0 || answer >= options.length || !explanation) {
    return NextResponse.json(
      { error: "질문, 보기(2개 이상), 정답, 해설을 모두 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  const created = await createQuizQuestion({ question, options, answer, explanation });
  return NextResponse.json({ question: created }, { status: 201 });
}
