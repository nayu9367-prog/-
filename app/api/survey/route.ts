import { NextRequest, NextResponse } from "next/server";
import {
  getSurveySettings,
  hasSurveyResponse,
  isSurveyKey,
  MAX_SURVEY_TEXT_LENGTH,
  saveSurveyResponse,
} from "@/lib/surveys";
import { getSessionStudentId } from "@/lib/studentPins";

const NEEDS_STUDENT = "학번 확인이 필요합니다. 학번과 PIN을 다시 입력해주세요.";

// Whether the signed-in student has already answered the survey.
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("survey");
  const studentId = await getSessionStudentId(request);
  if (!isSurveyKey(key)) {
    return NextResponse.json({ error: "설문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (!studentId) {
    return NextResponse.json({ error: NEEDS_STUDENT }, { status: 401 });
  }
  return NextResponse.json({ submitted: await hasSurveyResponse(key, studentId) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const key = body?.survey;
  // The student ID comes from the session, never from the request body.
  const studentId = await getSessionStudentId(request);

  if (!isSurveyKey(key)) {
    return NextResponse.json({ error: "설문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (!studentId) {
    return NextResponse.json({ error: NEEDS_STUDENT }, { status: 401 });
  }

  const survey = (await getSurveySettings())[key];
  if (!survey.open) {
    return NextResponse.json({ error: "지금은 응답을 받지 않는 설문입니다." }, { status: 403 });
  }

  const choices: unknown[] = Array.isArray(body?.choices) ? body.choices : [];
  const valid =
    choices.length === survey.choiceQuestions.length &&
    survey.choiceQuestions.every((q, idx) => {
      const choice = choices[idx];
      return Number.isInteger(choice) && (choice as number) >= 0 && (choice as number) < q.options.length;
    });
  if (!valid) {
    return NextResponse.json({ error: "객관식 문항에 모두 응답해주세요." }, { status: 400 });
  }
  const text =
    survey.textQuestion && typeof body?.text === "string"
      ? body.text.trim().slice(0, MAX_SURVEY_TEXT_LENGTH)
      : "";

  await saveSurveyResponse(key, studentId, {
    choices: choices as number[],
    text,
    submittedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
