import { neon } from "@neondatabase/serverless";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSettings = {
  items: FaqItem[];
};

const SETTINGS_KEY = "faq";

export const DEFAULT_FAQ_SETTINGS: FaqSettings = { items: [] };

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

export async function getFaqSettings(): Promise<FaqSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: FaqSettings }[];
  return rows[0]?.value ?? DEFAULT_FAQ_SETTINGS;
}

export async function updateFaqSettings(value: FaqSettings): Promise<FaqSettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: FaqSettings }[];
  return rows[0].value;
}
