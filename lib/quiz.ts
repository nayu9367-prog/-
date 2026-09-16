import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { QuizQuestion } from "@/lib/quizData";

type QuizQuestionRow = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  created_at: string;
};

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL(또는 POSTGRES_URL) 환경변수가 설정되지 않았습니다.");
  }
  return url;
}

function getSql() {
  return neon(requireDatabaseUrl());
}

function toQuizQuestion(row: QuizQuestionRow): QuizQuestion {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    answer: row.answer,
    explanation: row.explanation,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, question, options, answer, explanation, created_at
    FROM quiz_questions
    ORDER BY created_at ASC
  `) as QuizQuestionRow[];
  return rows.map(toQuizQuestion);
}

export type QuizQuestionInput = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export async function createQuizQuestion(input: QuizQuestionInput): Promise<QuizQuestion> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO quiz_questions (id, question, options, answer, explanation, created_at)
    VALUES (${id}, ${input.question}, ${input.options}, ${input.answer}, ${input.explanation}, ${now})
    RETURNING id, question, options, answer, explanation, created_at
  `) as QuizQuestionRow[];
  return toQuizQuestion(rows[0]);
}

export async function updateQuizQuestion(
  id: string,
  input: QuizQuestionInput
): Promise<QuizQuestion | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE quiz_questions
    SET question = ${input.question}, options = ${input.options}, answer = ${input.answer},
        explanation = ${input.explanation}
    WHERE id = ${id}
    RETURNING id, question, options, answer, explanation, created_at
  `) as QuizQuestionRow[];
  return rows[0] ? toQuizQuestion(rows[0]) : null;
}

export async function deleteQuizQuestion(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM quiz_questions WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export type QuizAnswerInput = {
  questionId: string;
  questionText: string;
  selectedIndex: number | null;
  isCorrect: boolean;
};

export type QuizSubmissionInput = {
  visitorId: string;
  studentId: string;
  answers: QuizAnswerInput[];
};

export async function recordQuizSubmission(input: QuizSubmissionInput): Promise<void> {
  const sql = getSql();
  const submissionId = randomUUID();
  const now = new Date().toISOString();
  const totalCount = input.answers.length;
  const correctCount = input.answers.filter((a) => a.isCorrect).length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  await sql`
    INSERT INTO quiz_submissions (id, visitor_id, student_id, correct_count, total_count, score, created_at)
    VALUES (${submissionId}, ${input.visitorId}, ${input.studentId}, ${correctCount}, ${totalCount}, ${score}, ${now})
  `;

  await Promise.all(
    input.answers.map((answer) =>
      sql`
        INSERT INTO quiz_answers (id, submission_id, question_id, question_text, selected_index, is_correct, created_at)
        VALUES (${randomUUID()}, ${submissionId}, ${answer.questionId}, ${answer.questionText}, ${answer.selectedIndex}, ${answer.isCorrect}, ${now})
      `
    )
  );
}

export type QuizSubmissionRecord = {
  id: string;
  studentId: string;
  correctCount: number;
  totalCount: number;
  score: number;
  createdAt: string;
};

type QuizSubmissionRow = {
  id: string;
  student_id: string | null;
  correct_count: number;
  total_count: number;
  score: number;
  created_at: string;
};

function toQuizSubmissionRecord(row: QuizSubmissionRow): QuizSubmissionRecord {
  return {
    id: row.id,
    studentId: row.student_id ?? "",
    correctCount: row.correct_count,
    totalCount: row.total_count,
    score: row.score,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getQuizSubmissions(): Promise<QuizSubmissionRecord[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, student_id, correct_count, total_count, score, created_at
    FROM quiz_submissions
    ORDER BY created_at DESC
  `) as QuizSubmissionRow[];
  return rows.map(toQuizSubmissionRecord);
}

export type QuizQuestionStat = {
  questionId: string;
  questionText: string;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  wrongRate: number;
};

export type QuizStatsSummary = {
  totalSubmissions: number;
  averageScore: number;
  questionStats: QuizQuestionStat[];
};

export async function getQuizStats(): Promise<QuizStatsSummary> {
  const sql = getSql();

  const [summaryRow] = (await sql`
    SELECT count(*)::int AS total_submissions, COALESCE(AVG(score), 0)::float AS average_score
    FROM quiz_submissions
  `) as { total_submissions: number; average_score: number }[];

  const questionRows = (await sql`
    SELECT
      question_id,
      (array_agg(question_text ORDER BY created_at DESC))[1] AS question_text,
      count(*)::int AS total_answers,
      count(*) FILTER (WHERE is_correct)::int AS correct_answers,
      count(*) FILTER (WHERE NOT is_correct)::int AS wrong_answers
    FROM quiz_answers
    GROUP BY question_id
    ORDER BY (count(*) FILTER (WHERE NOT is_correct))::float / count(*) DESC, total_answers DESC
  `) as {
    question_id: string;
    question_text: string;
    total_answers: number;
    correct_answers: number;
    wrong_answers: number;
  }[];

  return {
    totalSubmissions: summaryRow?.total_submissions ?? 0,
    averageScore: Math.round(summaryRow?.average_score ?? 0),
    questionStats: questionRows.map((row) => ({
      questionId: row.question_id,
      questionText: row.question_text,
      totalAnswers: row.total_answers,
      correctAnswers: row.correct_answers,
      wrongAnswers: row.wrong_answers,
      wrongRate:
        row.total_answers > 0 ? Math.round((row.wrong_answers / row.total_answers) * 100) : 0,
    })),
  };
}
