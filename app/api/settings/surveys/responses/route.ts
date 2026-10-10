import { NextRequest, NextResponse } from "next/server";
import { clearSurveyResponses, deleteSurveyResponse, isSurveyKey } from "@/lib/surveys";

// Removes one response, or every response when none is named.
export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("survey");
  const id = request.nextUrl.searchParams.get("id");
  if (!isSurveyKey(key)) {
    return NextResponse.json({ error: "설문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (id) {
    await deleteSurveyResponse(key, id);
  } else {
    await clearSurveyResponses(key);
  }
  return NextResponse.json({ ok: true });
}
