import { neon } from "@neondatabase/serverless";

export type ResourceColorKey = "emerald" | "sky" | "teal" | "amber";

export const RESOURCE_COLOR_KEYS: ResourceColorKey[] = ["emerald", "sky", "teal", "amber"];

export type OmahaDomain = {
  title: string;
  desc: string;
  example: string;
  colorKey: ResourceColorKey;
};

export type ResourceTemplate = {
  icon: string;
  title: string;
  desc: string;
  text: string;
  colorKey: ResourceColorKey;
};

export type ResourcesSettings = {
  omahaDomains: OmahaDomain[];
  templates: ResourceTemplate[];
};

const SETTINGS_KEY = "resources";

export const DEFAULT_RESOURCES_SETTINGS: ResourcesSettings = {
  omahaDomains: [
    {
      title: "1. 환경 영역 (Environmental)",
      desc: "수질, 주거환경, 안전, 난방, 위생 상태 등 물리적 주변 환경 문제.",
      example: "예: 불결한 주거환경, 낙상 위험 환경",
      colorKey: "emerald",
    },
    {
      title: "2. 사회심리 영역 (Psychosocial)",
      desc: "사회적 고립, 우울, 가족관계, 학대, 자존감 등 동반 관계 문제.",
      example: "예: 사회적 고립, 방임/우울",
      colorKey: "sky",
    },
    {
      title: "3. 생리 영역 (Physiological)",
      desc: "신체 기능, 질병 증상, 통증, 감각, 시력/청력 상태 등 생리학적 문제.",
      example: "예: 신체활동 장애, 혈당 조절 장애",
      colorKey: "teal",
    },
    {
      title: "4. 건강관련 행위 영역 (Health-related Behaviors)",
      desc: "영양, 식이, 영양섭취, 운동, 복약 이행, 흡연/음주 수칙.",
      example: "예: 약물 복용 이행 부적절, 불균형적 영양",
      colorKey: "amber",
    },
  ],
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
  return rows[0]?.value ?? DEFAULT_RESOURCES_SETTINGS;
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
