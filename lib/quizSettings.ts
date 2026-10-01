import { neon } from "@neondatabase/serverless";

export type QuizSettings = {
  // How many questions one attempt draws at random from the question bank.
  questionCount: number;
};

export const MIN_QUIZ_QUESTION_COUNT = 3;
export const MAX_QUIZ_QUESTION_COUNT = 20;

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = { questionCount: 5 };

const SETTINGS_KEY = "quiz";

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

export async function getQuizSettings(): Promise<QuizSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: QuizSettings }[];
  return rows[0]?.value ?? DEFAULT_QUIZ_SETTINGS;
}

export async function updateQuizSettings(value: QuizSettings): Promise<QuizSettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: QuizSettings }[];
  return rows[0].value;
}
