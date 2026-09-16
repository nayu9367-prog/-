import { NextRequest, NextResponse } from "next/server";
import { getQuizSubmissionsByStudentId } from "@/lib/quiz";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId")?.trim() ?? "";
  if (!studentId) {
    return NextResponse.json({ error: "학번을 입력해주세요." }, { status: 400 });
  }

  const submissions = await getQuizSubmissionsByStudentId(studentId);
  return NextResponse.json({ submissions });
}
