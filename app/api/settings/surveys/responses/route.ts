import { NextRequest, NextResponse } from "next/server";
import { clearSurveyResponses, deleteSurveyResponse, isSurveyKey } from "@/lib/surveys";

// Removes one student's response, or every response when no student is named.
export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("survey");
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!isSurveyKey(key)) {
    return NextResponse.json({ error: "설문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (studentId) {
    await deleteSurveyResponse(key, studentId);
  } else {
    await clearSurveyResponses(key);
  }
  return NextResponse.json({ ok: true });
}
