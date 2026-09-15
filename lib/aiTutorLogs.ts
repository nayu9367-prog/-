import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export type AiTutorLog = {
  id: string;
  message: string;
  answer: string;
  visitorId: string;
  createdAt: string;
};

type AiTutorLogRow = {
  id: string;
  message: string;
  answer: string;
  visitor_id: string;
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

function toAiTutorLog(row: AiTutorLogRow): AiTutorLog {
  return {
    id: row.id,
    message: row.message,
    answer: row.answer,
    visitorId: row.visitor_id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function recordAiTutorLog(
  message: string,
  answer: string,
  visitorId: string
): Promise<void> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO ai_tutor_logs (id, message, answer, visitor_id, created_at)
    VALUES (${id}, ${message}, ${answer}, ${visitorId}, ${now})
  `;
}

export async function getAiTutorLogs(limit = 50): Promise<AiTutorLog[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, message, answer, visitor_id, created_at
    FROM ai_tutor_logs
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as AiTutorLogRow[];
  return rows.map(toAiTutorLog);
}

export async function getAiTutorLogCount(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`SELECT count(*)::int AS count FROM ai_tutor_logs`) as {
    count: number;
  }[];
  return rows[0]?.count ?? 0;
}

export async function deleteAiTutorLog(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM ai_tutor_logs WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function deleteAllAiTutorLogs(): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM ai_tutor_logs`;
}
