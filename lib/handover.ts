import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { HandoverFile } from "@/lib/handoverData";

// Files are kept as one JSON object keyed by file ID.
const SETTINGS_KEY = "handover-files";

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

export async function getHandoverFiles(): Promise<HandoverFile[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: Record<string, HandoverFile> }[];
  return Object.values(rows[0]?.value ?? {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createHandoverFile(
  input: Omit<HandoverFile, "id" | "createdAt">
): Promise<HandoverFile> {
  const sql = getSql();
  const file: HandoverFile = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  // Merged in the database in one statement, so two students uploading at
  // the same moment can't overwrite each other's files.
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify({ [file.id]: file })}::jsonb, ${file.createdAt})
    ON CONFLICT (key) DO UPDATE
      SET value = site_settings.value || EXCLUDED.value, updated_at = EXCLUDED.updated_at
  `;
  return file;
}

// Returns the removed entry, so its stored file can be removed too.
export async function deleteHandoverFile(id: string): Promise<HandoverFile | null> {
  const sql = getSql();
  const found = (await sql`
    SELECT value -> ${id}::text AS file FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { file: HandoverFile | null }[];
  const file = found[0]?.file ?? null;
  if (!file) return null;
  await sql`
    UPDATE site_settings
    SET value = value - ${id}::text, updated_at = ${new Date().toISOString()}
    WHERE key = ${SETTINGS_KEY}
  `;
  return file;
}
