import { NextRequest, NextResponse } from "next/server";
import {
  getSurveySettings,
  isSurveyKey,
  MAX_SURVEY_TEXT_LENGTH,
  saveSurveyResponse,
} from "@/lib/surveys";

// Anonymous: the response is stored without anything that identifies the
// student, so the request carries no student ID and none is looked up.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const key = body?.survey;

  if (!isSurveyKey(key)) {
    return NextResponse.json({ error: "설문을 찾을 수 없습니다." }, { status: 404 });
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

  await saveSurveyResponse(key, {
    choices: choices as number[],
    text,
    submittedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
