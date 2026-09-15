import { NextRequest, NextResponse } from "next/server";
import { deleteProfessorQuestion } from "@/lib/professorQuestions";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteProfessorQuestion(id);
  if (!deleted) {
    return NextResponse.json({ error: "해당 질문을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
