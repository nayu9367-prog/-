import { NextRequest, NextResponse } from "next/server";
import { deleteQuizQuestion, updateQuizQuestion } from "@/lib/quiz";

type RouteContext = { params: Promise<{ id: string }> };

function parseOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
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

  const updated = await updateQuizQuestion(id, { question, options, answer, explanation });
  if (!updated) {
    return NextResponse.json({ error: "해당 문제를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ question: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteQuizQuestion(id);
  if (!deleted) {
    return NextResponse.json({ error: "해당 문제를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
