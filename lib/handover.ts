import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { HandoverNote } from "@/lib/handoverData";

// Notes are kept as one JSON object keyed by note ID.
const SETTINGS_KEY = "handover-notes";

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

export async function getHandoverNotes(): Promise<HandoverNote[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: Record<string, HandoverNote> }[];
  return Object.values(rows[0]?.value ?? {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createHandoverNote(
  input: Omit<HandoverNote, "id" | "createdAt">
): Promise<HandoverNote> {
  const sql = getSql();
  const note: HandoverNote = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  // Merged in the database in one statement, so two students saving at the
  // same moment can't overwrite each other's notes.
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify({ [note.id]: note })}::jsonb, ${note.createdAt})
    ON CONFLICT (key) DO UPDATE
      SET value = site_settings.value || EXCLUDED.value, updated_at = EXCLUDED.updated_at
  `;
  return note;
}

export async function deleteHandoverNote(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE site_settings
    SET value = value - ${id}, updated_at = ${new Date().toISOString()}
    WHERE key = ${SETTINGS_KEY} AND value ? ${id}
    RETURNING key
  `) as { key: string }[];
  return rows.length > 0;
}
