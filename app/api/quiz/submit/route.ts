import { NextRequest, NextResponse } from "next/server";
import { getQuizQuestions, recordQuizSubmission, type QuizAnswerInput } from "@/lib/quiz";

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
  const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
  const answers = parseAnswers(body?.answers);

  if (!studentId) {
    return NextResponse.json({ error: "학번을 입력해주세요." }, { status: 400 });
  }
  if (answers.length === 0) {
    return NextResponse.json({ error: "제출할 답안이 없습니다." }, { status: 400 });
  }

  // Grade here rather than trusting the browser's own `isCorrect`: the score
  // goes on record under the student's ID, and a hand-made request could
  // otherwise claim any score. Answers to questions that no longer exist
  // (deleted mid-attempt) can't be checked and are left out.
  const bank = new Map((await getQuizQuestions()).map((q) => [q.id, q]));
  const graded = answers.flatMap((a) => {
    const question = bank.get(a.questionId);
    if (!question) return [];
    return [
      {
        questionId: question.id,
        questionText: question.question,
        selectedIndex: a.selectedIndex,
        isCorrect: a.selectedIndex === question.answer,
      },
    ];
  });
  if (graded.length === 0) {
    return NextResponse.json({ error: "제출할 답안이 없습니다." }, { status: 400 });
  }

  await recordQuizSubmission({ visitorId, studentId, answers: graded });
  return NextResponse.json({ ok: true }, { status: 201 });
}
