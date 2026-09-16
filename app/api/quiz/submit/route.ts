import { NextRequest, NextResponse } from "next/server";
import { recordQuizSubmission, type QuizAnswerInput } from "@/lib/quiz";

function parseAnswers(value: unknown): QuizAnswerInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): QuizAnswerInput | null => {
      if (typeof entry !== "object" || entry === null) return null;
      const rec = entry as Record<string, unknown>;
      const questionId = typeof rec.questionId === "string" ? rec.questionId : "";
      const questionText = typeof rec.questionText === "string" ? rec.questionText : "";
      const selectedIndex = Number.isInteger(rec.selectedIndex) ? (rec.selectedIndex as number) : null;
      const isCorrect = typeof rec.isCorrect === "boolean" ? rec.isCorrect : false;
      if (!questionId || !questionText) return null;
      return { questionId, questionText, selectedIndex, isCorrect };
    })
    .filter((a): a is QuizAnswerInput => a !== null);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const visitorId = typeof body?.visitorId === "string" && body.visitorId ? body.visitorId : "anonymous";
  const answers = parseAnswers(body?.answers);

  if (answers.length === 0) {
    return NextResponse.json({ error: "제출할 답안이 없습니다." }, { status: 400 });
  }

  await recordQuizSubmission({ visitorId, answers });
  return NextResponse.json({ ok: true }, { status: 201 });
}
