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
