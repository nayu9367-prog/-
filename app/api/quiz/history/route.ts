import { NextRequest, NextResponse } from "next/server";
import { getQuizSubmissionsByStudentId } from "@/lib/quiz";
import { getSessionStudentId } from "@/lib/studentPins";

// The signed-in student's own quiz record.
export async function GET(request: NextRequest) {
  const studentId = await getSessionStudentId(request);
  if (!studentId) {
    return NextResponse.json(
      { error: "학번 확인이 필요합니다. 학번과 PIN을 다시 입력해주세요." },
      { status: 401 }
    );
  }

  const submissions = await getQuizSubmissionsByStudentId(studentId);
  return NextResponse.json({ submissions });
}
