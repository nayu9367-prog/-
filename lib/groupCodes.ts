import { neon } from "@neondatabase/serverless";
import { createHash, timingSafeEqual } from "crypto";

import {
  normalizeGroupCode,
  type GroupCode,
  type GroupCodesSettings,
  type GroupLogin,
} from "@/lib/groupCodesData";

const SETTINGS_KEY = "group-codes";
const LOGINS_KEY = "group-code-logins";

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

export async function getGroupCodes(): Promise<GroupCodesSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: GroupCodesSettings }[];
  return rows[0]?.value ?? { groups: [] };
}

export async function updateGroupCodes(value: GroupCodesSettings): Promise<GroupCodesSettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: GroupCodesSettings }[];
  return rows[0].value;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

// The groups whose codes currently let someone in. While there are none the
// site falls back to its shared entry password.
export async function getActiveGroupCodes(): Promise<GroupCode[]> {
  const { groups } = await getGroupCodes();
  return groups.filter((group) => group.active && group.code);
}

// Every group is compared, and by digest, so how long the check takes says
// nothing about which code came close.
export function matchGroupCode(groups: GroupCode[], entered: string): GroupCode | null {
  const target = digest(normalizeGroupCode(entered));
  let found: GroupCode | null = null;
  for (const group of groups) {
    if (timingSafeEqual(digest(normalizeGroupCode(group.code)), target)) found = group;
  }
  return found;
}

// Counted in the database in one statement, so a class entering at the same
// moment can't lose each other's count.
export async function recordGroupLogin(groupId: string): Promise<void> {
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (
      ${LOGINS_KEY},
      jsonb_build_object(${groupId}::text, jsonb_build_object('count', 1, 'lastAt', ${now}::text)),
      ${now}
    )
    ON CONFLICT (key) DO UPDATE
      SET value = site_settings.value || jsonb_build_object(
            ${groupId}::text,
            jsonb_build_object(
              'count', COALESCE((site_settings.value -> ${groupId}::text ->> 'count')::int, 0) + 1,
              'lastAt', ${now}::text
            )
          ),
          updated_at = EXCLUDED.updated_at
  `;
}

export async function getGroupLogins(): Promise<Record<string, GroupLogin>> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${LOGINS_KEY}
  `) as { value: Record<string, GroupLogin> }[];
  return rows[0]?.value ?? {};
}
