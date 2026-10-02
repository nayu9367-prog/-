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
  text?: string;
  colorKey: ResourceColorKey;
  fileUrl?: string;
  fileName?: string;
};

export type ResourcesSettings = {
  templates: ResourceTemplate[];
};

const SETTINGS_KEY = "resources";

export const DEFAULT_RESOURCES_SETTINGS: ResourcesSettings = {
  templates: [
    {
      icon: "fa-solid fa-file-contract",
      title: "OMAHA 진단 문제목록 양식",
      desc: "영역-문제-증상표징(S/S) 3단계 구조화 양식입니다.",
      colorKey: "emerald",
      text: "=== OMAHA 간호진단 문제목록 양식 ===\n1. 영역 (Domain):\n2. 문제 (Problem):\n3. 증상 및 표징 (Signs/Symptoms):\n4. 목표 (Outcome Target):\n5. 간호중재 (Interventions):",
    },
    {
      icon: "fa-solid fa-chalkboard-user",
      title: "15분 보건교육 계획안 템플릿",
      desc: "도입-전개-정리 3단계 시안 양식입니다.",
      colorKey: "teal",
      text: "=== 15분 보건교육 계획안 ===\n- 교육 주제:\n- 대상자:\n- 도입 (3분): 동기 유발 및 형성 평가\n- 전개 (9분): 핵심 내용 전달 및 시연\n- 정리 (3분): 요약 및 퀴즈 평가",
    },
    {
      icon: "fa-solid fa-house-user",
      title: "방문간호 가정환경 사정도구",
      desc: "낙상위험 및 보행장애 체크리스트 양식입니다.",
      colorKey: "sky",
      text: "=== 방문간호 가정환경 사정표 ===\n[ ] 현관/복도 조도\n[ ] 욕실 미끄럼 방지 매트\n[ ] 방 문턱 장애물\n[ ] 보행보조기구 고무 패드 상태",
    },
  ],
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
