import { neon } from "@neondatabase/serverless";

export type ResourceColorKey = "emerald" | "sky" | "teal" | "amber";

export const RESOURCE_COLOR_KEYS: ResourceColorKey[] = ["emerald", "sky", "teal", "amber"];

// The icons an admin can pick for a form's card, by what they depict. A
// stored icon outside this list (from when the field was free text) is kept.
export const RESOURCE_ICONS = [
  { value: "fa-solid fa-file", label: "문서" },
  { value: "fa-solid fa-file-lines", label: "보고서" },
  { value: "fa-solid fa-file-contract", label: "양식" },
  { value: "fa-solid fa-list-check", label: "체크리스트" },
  { value: "fa-solid fa-table", label: "표" },
  { value: "fa-solid fa-book", label: "지침서" },
  { value: "fa-solid fa-chalkboard-user", label: "교육" },
  { value: "fa-solid fa-house-user", label: "가정방문" },
  { value: "fa-solid fa-stethoscope", label: "간호" },
] as const;

export type ResourceTemplate = {
  icon: string;
  title: string;
  desc: string;
  colorKey: ResourceColorKey;
  // Missing only on entries saved when a form could be copy-paste text
  // instead of a file; those are not shown to students.
  fileUrl?: string;
  fileName?: string;
};

export type ResourcesSettings = {
  templates: ResourceTemplate[];
};

const SETTINGS_KEY = "resources";

export const DEFAULT_RESOURCES_SETTINGS: ResourcesSettings = { templates: [] };

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

export async function getResourcesSettings(): Promise<ResourcesSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: ResourcesSettings }[];
  // Settings saved while the page also carried an OMAHA guide still hold
  // it; only the forms are used now.
  const templates = rows[0]?.value?.templates;
  return templates ? { templates } : DEFAULT_RESOURCES_SETTINGS;
}

export async function updateResourcesSettings(
  value: ResourcesSettings
): Promise<ResourcesSettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: ResourcesSettings }[];
  return rows[0].value;
}
