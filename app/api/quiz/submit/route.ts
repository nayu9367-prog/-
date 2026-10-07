import { NextRequest, NextResponse } from "next/server";
import { getQuizQuestions, recordQuizSubmission } from "@/lib/quiz";
import { isEssayQuestion, type QuizResult } from "@/lib/quizData";
import { getSessionStudentId } from "@/lib/studentPins";

type SubmittedAnswer = { questionId: string; selectedIndex: number | null; answerText: string };

const MAX_ESSAY_ANSWER_LENGTH = 2000;

function parseAnswers(value: unknown): SubmittedAnswer[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): SubmittedAnswer | null => {
      if (typeof entry !== "object" || entry === null) return null;
      const rec = entry as Record<string, unknown>;
      const questionId = typeof rec.questionId === "string" ? rec.questionId : "";
      const selectedIndex = Number.isInteger(rec.selectedIndex) ? (rec.selectedIndex as number) : null;
      const answerText =
        typeof rec.answerText === "string"
          ? rec.answerText.trim().slice(0, MAX_ESSAY_ANSWER_LENGTH)
          : "";
      if (!questionId) return null;
      return { questionId, selectedIndex, answerText };
    })
    .filter((a): a is SubmittedAnswer => a !== null);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const visitorId = typeof body?.visitorId === "string" && body.visitorId ? body.visitorId : "anonymous";
  const studentId = await getSessionStudentId(request);
  const answers = parseAnswers(body?.answers);

  if (!studentId) {
    return NextResponse.json(
      { error: "학번 확인이 필요합니다. 학번과 PIN을 다시 입력해주세요." },
      { status: 401 }
    );
  }
  if (answers.length === 0) {
    return NextResponse.json({ error: "제출할 답안이 없습니다." }, { status: 400 });
  }

  // Grading happens here, against the question bank: the browser never has
  // the answers, and the score goes on record under the student's ID.
  // Answers to questions that no longer exist (deleted mid-attempt) can't be
  // checked and are left out. A question answered twice counts once.
  const bank = new Map((await getQuizQuestions()).map((q) => [q.id, q]));
  const seen = new Set<string>();
  const results: QuizResult[] = [];
  for (const answer of answers) {
    const question = bank.get(answer.questionId);
    if (!question || seen.has(question.id)) continue;
    seen.add(question.id);
    // An essay answer isn't graded: the student compares it with the model
    // answer, and it is kept for the professor to read.
    const essay = isEssayQuestion(question);
    results.push({
      questionId: question.id,
      question: question.question,
      options: question.options,
      selectedIndex: essay ? null : answer.selectedIndex,
      answerText: essay ? answer.answerText : null,
      correctIndex: question.answer,
      isCorrect: !essay && answer.selectedIndex === question.answer,
      explanation: question.explanation,
    });
  }
  if (results.length === 0) {
    return NextResponse.json({ error: "제출할 답안이 없습니다." }, { status: 400 });
  }

  await recordQuizSubmission({
    visitorId,
    studentId,
    answers: results.map((r) => ({
      questionId: r.questionId,
      questionText: r.question,
      selectedIndex: r.selectedIndex,
      answerText: r.answerText,
      isCorrect: r.isCorrect,
    })),
  });

  return NextResponse.json({ ok: true, results }, { status: 201 });
}
