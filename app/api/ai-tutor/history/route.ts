import { NextRequest, NextResponse } from "next/server";
import { getAiTutorLogsByStudentId } from "@/lib/aiTutorLogs";

// A student's own past tutor conversation, looked up by student ID the same
// way quiz history is.
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId")?.trim().slice(0, 30) ?? "";
  if (!studentId) {
    return NextResponse.json({ error: "학번을 입력해주세요." }, { status: 400 });
  }

  const logs = await getAiTutorLogsByStudentId(studentId);
  return NextResponse.json({
    history: logs.map((log) => ({
      id: log.id,
      message: log.message,
      answer: log.answer,
      category: log.category ?? null,
      createdAt: log.createdAt,
    })),
  });
}
