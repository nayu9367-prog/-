import { neon } from "@neondatabase/serverless";

export type QuickActionColor = "emerald" | "amber" | "sky";

export type QuickAction = {
  icon: string;
  color: QuickActionColor;
  title: string;
  desc: string;
  href: string;
  cta: string;
};

export type DashboardSettings = {
  heroTitle: string;
  heroSubtitle: string;
  quickActions: QuickAction[];
  checklist: string[];
};

const SETTINGS_KEY = "dashboard";

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  heroTitle: "환영합니다, NursiHub와 함께 실습을 준비해요 🌿",
  heroSubtitle: "공지사항 확인부터 퀴즈, BPRN 계산, 실습 자료까지 한 곳에서 관리하세요.",
  quickActions: [
    {
      href: "/ai-tutor",
      icon: "fa-solid fa-robot",
      color: "emerald",
      title: "AI 사례 & 보건교육 튜터",
      desc: "OMAHA 진단 분류, 방문간호 상담 연습, 보건교육 계획안 작성 피드백을 받아보세요.",
      cta: "대화 시작하기",
    },
    {
      href: "/quiz",
      icon: "fa-solid fa-gamepad",
      color: "amber",
      title: "지역사회 실습 퀴즈",
      desc: "BPRN 우선순위, OMAHA 진단, 방문간호 감염 관리 핵심 퀴즈를 풀어보세요.",
      cta: "퀴즈 풀러 가기",
    },
    {
      href: "/skills",
      icon: "fa-solid fa-circle-play",
      color: "sky",
      title: "핵심술기 동영상 관",
      desc: "방문간호 Nurse Bag 세팅, 노인 기능 사정 등 핵심 수행지침 영상을 시청하세요.",
      cta: "영상 시청하기",
    },
  ],
  checklist: [
    "방문간호 가방 오염 방지용 신문지/매트 챙기기",
    "K-ADL / K-IADL 노인 기능 사정 도구 숙지",
    "BPRN 우선순위 산출 공식 (A+2B)×C 복습",
    "15분 만성질환 보건교육 리플렛 및 교구 준비",
    "OMAHA 진단 문제 목록 4대 영역에 맞게 작성",
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

export async function getDashboardSettings(): Promise<DashboardSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: DashboardSettings }[];
  return rows[0]?.value ?? DEFAULT_DASHBOARD_SETTINGS;
}

export async function updateDashboardSettings(
  value: DashboardSettings
): Promise<DashboardSettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: DashboardSettings }[];
  return rows[0].value;
}
