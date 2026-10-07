import { NextRequest, NextResponse } from "next/server";
import { deleteQuizQuestion, updateQuizQuestion } from "@/lib/quiz";
import { normalizeQuizQuestionInput } from "@/lib/quizImport";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const input = normalizeQuizQuestionInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "질문과 해설을 입력하고, 객관식은 보기(2개 이상)와 정답을 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  const updated = await updateQuizQuestion(id, input);
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
