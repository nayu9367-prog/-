import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export type ProfessorQuestion = {
  id: string;
  name: string;
  studentId: string;
  question: string;
  createdAt: string;
};

type ProfessorQuestionRow = {
  id: string;
  name: string;
  student_id: string;
  question: string;
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

function toProfessorQuestion(row: ProfessorQuestionRow): ProfessorQuestion {
  return {
    id: row.id,
    name: row.name,
    studentId: row.student_id,
    question: row.question,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function recordProfessorQuestion(
  name: string,
  studentId: string,
  question: string
): Promise<void> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO professor_questions (id, name, student_id, question, created_at)
    VALUES (${id}, ${name}, ${studentId}, ${question}, ${now})
  `;
}

export async function getProfessorQuestions(limit = 50): Promise<ProfessorQuestion[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, student_id, question, created_at
    FROM professor_questions
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as ProfessorQuestionRow[];
  return rows.map(toProfessorQuestion);
}

export async function getProfessorQuestionCount(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`SELECT count(*)::int AS count FROM professor_questions`) as {
    count: number;
  }[];
  return rows[0]?.count ?? 0;
}

export async function deleteProfessorQuestion(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM professor_questions WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function deleteAllProfessorQuestions(): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM professor_questions`;
}
