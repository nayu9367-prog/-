import { NextRequest, NextResponse } from "next/server";
import { getAiTutorLogsByStudentId } from "@/lib/aiTutorLogs";
import { getSessionStudentId } from "@/lib/studentPins";

// The signed-in student's own past tutor conversation.
export async function GET(request: NextRequest) {
  const studentId = await getSessionStudentId(request);
  if (!studentId) {
    return NextResponse.json(
      { error: "학번 확인이 필요합니다. 학번과 PIN을 다시 입력해주세요." },
      { status: 401 }
    );
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
