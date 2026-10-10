import { neon } from "@neondatabase/serverless";

// The record that a student has watched every skill video.
export type SkillCertificate = {
  studentId: string;
  issuedAt: string;
  // The videos' titles at the time, so later changes to the list don't
  // rewrite what the student completed.
  skills: string[];
};

// Kept as one JSON object keyed by student ID.
const SETTINGS_KEY = "skill-certificates";

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

export async function getSkillCertificates(): Promise<SkillCertificate[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: Record<string, SkillCertificate> }[];
  return Object.values(rows[0]?.value ?? {}).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export async function getSkillCertificate(studentId: string): Promise<SkillCertificate | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value -> ${studentId}::text AS certificate FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { certificate: SkillCertificate | null }[];
  return rows[0]?.certificate ?? null;
}

// The first certificate stands: issuing again returns the one already there.
export async function issueSkillCertificate(studentId: string, skills: string[]): Promise<SkillCertificate> {
  const sql = getSql();
  const certificate: SkillCertificate = { studentId, issuedAt: new Date().toISOString(), skills };
  // Merged in the database in one statement, with the stored side winning.
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify({ [studentId]: certificate })}::jsonb, ${certificate.issuedAt})
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value || site_settings.value, updated_at = EXCLUDED.updated_at
  `;
  return (await getSkillCertificate(studentId)) ?? certificate;
}

export async function deleteSkillCertificate(studentId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE site_settings
    SET value = value - ${studentId}::text, updated_at = ${new Date().toISOString()}
    WHERE key = ${SETTINGS_KEY}
  `;
}
