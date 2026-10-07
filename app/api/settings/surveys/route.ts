import { NextRequest, NextResponse } from "next/server";
import {
  MAX_SURVEY_CHOICE_QUESTIONS,
  MAX_SURVEY_OPTIONS,
  SURVEY_KEYS,
  SURVEY_LABELS,
  updateSurveySettings,
  type Survey,
  type SurveyChoiceQuestion,
  type SurveySettings,
} from "@/lib/surveys";

// Returns the survey, or a message naming the first thing that can't be
// saved.
function parseSurvey(value: unknown, label: string): Survey | string {
  const rec = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const intro = typeof rec.intro === "string" ? rec.intro.trim().slice(0, 500) : "";
  const textQuestion =
    typeof rec.textQuestion === "string" ? rec.textQuestion.trim().slice(0, 300) : "";
  const rawQuestions: unknown[] = Array.isArray(rec.choiceQuestions) ? rec.choiceQuestions : [];

  if (rawQuestions.length > MAX_SURVEY_CHOICE_QUESTIONS) {
    return `${label}: 객관식 문항은 최대 ${MAX_SURVEY_CHOICE_QUESTIONS}개까지 등록할 수 있습니다.`;
  }
  const choiceQuestions: SurveyChoiceQuestion[] = [];
  for (const [idx, raw] of rawQuestions.entries()) {
    const item = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const question = typeof item.question === "string" ? item.question.trim().slice(0, 300) : "";
    const options = Array.isArray(item.options)
      ? item.options
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.trim().slice(0, 100))
          .filter(Boolean)
      : [];
    if (!question) return `${label} 객관식 ${idx + 1}번: 문항 내용을 입력해주세요.`;
    if (options.length < 2 || options.length > MAX_SURVEY_OPTIONS) {
      return `${label} 객관식 ${idx + 1}번: 보기는 2~${MAX_SURVEY_OPTIONS}개로 입력해주세요.`;
    }
    choiceQuestions.push({ question, options });
  }
  if (choiceQuestions.length === 0 && !textQuestion) {
    return `${label}: 문항을 하나 이상 입력해주세요.`;
  }
  return { intro, open: rec.open === true, choiceQuestions, textQuestion };
}

// No GET: the pages load the surveys on the server.
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const settings = {} as SurveySettings;
  for (const key of SURVEY_KEYS) {
    const survey = parseSurvey(body?.[key], SURVEY_LABELS[key]);
    if (typeof survey === "string") {
      return NextResponse.json({ error: survey }, { status: 400 });
    }
    settings[key] = survey;
  }
  const saved = await updateSurveySettings(settings);
  return NextResponse.json({ settings: saved });
}
