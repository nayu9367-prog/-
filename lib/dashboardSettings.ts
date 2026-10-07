import { neon } from "@neondatabase/serverless";

export type QuickActionColor = "emerald" | "amber" | "sky";

// The dashboard groups its shortcuts by when in the practicum a student
// needs them.
export const DASHBOARD_PHASES = [
  { key: "before", label: "실습 전", sub: "준비 · 계획" },
  { key: "during", label: "실습 중", sub: "수행 · 학습" },
  { key: "after", label: "실습 후", sub: "점검 · 개선" },
  { key: "always", label: "상시", sub: "언제든 이용" },
] as const;

export type DashboardPhase = (typeof DASHBOARD_PHASES)[number]["key"];

export function isDashboardPhase(value: unknown): value is DashboardPhase {
  return DASHBOARD_PHASES.some((p) => p.key === value);
}

const PHASE_BY_HREF: Record<string, DashboardPhase> = {
  "/quiz": "before",
  "/survey/pre": "before",
  "/community": "after",
  "/handover": "after",
  "/survey/post": "after",
  "/resources": "always",
  "/question": "always",
  "/faq": "always",
  "/institutions": "always",
};

// Cards saved before phases existed carry none, so they are placed by
// where they link to.
export function getActionPhase(action: QuickAction): DashboardPhase {
  return action.phase ?? PHASE_BY_HREF[action.href] ?? "during";
}

export type QuickAction = {
  phase?: DashboardPhase;
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
  heroSubtitle: "공지사항 확인부터 퀴즈, BPRS 계산, 실습 자료까지 한 곳에서 관리하세요.",
  quickActions: [
    {
      phase: "before",
      href: "/survey/pre",
      icon: "fa-solid fa-clipboard-list",
      color: "sky",
      title: "사전 요구도 조사",
      desc: "실습 전에 기대하는 점과 필요한 점을 알려 주세요.",
      cta: "설문 참여하기",
    },
    {
      phase: "before",
      href: "/quiz",
      icon: "fa-solid fa-gamepad",
      color: "amber",
      title: "지역사회 실습 퀴즈",
      desc: "BPRS 우선순위, OMAHA 진단, 방문간호 감염 관리 핵심 퀴즈를 풀어보세요.",
      cta: "퀴즈 풀러 가기",
    },
    {
      phase: "during",
      href: "/skills",
      icon: "fa-solid fa-circle-play",
      color: "sky",
      title: "핵심술기 동영상",
      desc: "피하주사(간이 혈당측정), 산소포화도·심전도 모니터, 기본심폐소생술 영상을 체크리스트와 함께 시청하세요.",
      cta: "영상 시청하기",
    },
    {
      phase: "during",
      href: "/tools",
      icon: "fa-solid fa-calculator",
      color: "amber",
      title: "BPRS 계산기·사정도구",
      desc: "BPRS 우선순위 점수를 계산하고 사정도구를 확인하세요.",
      cta: "도구 열기",
    },
    {
      phase: "during",
      href: "/cases",
      icon: "fa-solid fa-notes-medical",
      color: "emerald",
      title: "AI 사례",
      desc: "어르신 대상자의 방문간호 시나리오를 읽고, 너시와 대화하며 사정과 중재를 연습해 보세요.",
      cta: "사례 보러 가기",
    },
    {
      phase: "during",
      href: "/ai-tutor",
      icon: "fa-solid fa-robot",
      color: "emerald",
      title: "너시(Nursi)튜터",
      desc: "사전학습, 지역보건의료기관, 사례연구, OMAHA 중 주제를 골라 너시에게 질문해 보세요.",
      cta: "대화 시작하기",
    },
    {
      phase: "after",
      href: "/community",
      icon: "fa-solid fa-comments",
      color: "sky",
      title: "실습 후기·Q&A",
      desc: "실습을 마친 뒤 후기와 궁금한 점을 나눠 보세요.",
      cta: "후기 남기기",
    },
    {
      phase: "after",
      href: "/handover",
      icon: "fa-solid fa-right-left",
      color: "emerald",
      title: "실습현장 인계사항",
      desc: "다음 조를 위해 실습기관에서 알아 두면 좋은 점을 남겨 주세요.",
      cta: "인계사항 보기",
    },
    {
      phase: "after",
      href: "/survey/post",
      icon: "fa-solid fa-clipboard-check",
      color: "amber",
      title: "사후 요구도 조사",
      desc: "실습을 마친 뒤 의견을 들려주세요.",
      cta: "설문 참여하기",
    },
    {
      phase: "always",
      href: "/resources",
      icon: "fa-solid fa-folder-open",
      color: "emerald",
      title: "실습 서식",
      desc: "과제와 보고서 양식을 내려받으세요.",
      cta: "서식 받기",
    },
    {
      phase: "always",
      href: "/question",
      icon: "fa-solid fa-envelope-open-text",
      color: "amber",
      title: "교수님께 질문",
      desc: "실습 중 궁금한 점을 교수님께 남겨 주세요.",
      cta: "질문 남기기",
    },
    {
      phase: "always",
      href: "/faq",
      icon: "fa-solid fa-circle-question",
      color: "sky",
      title: "자주 묻는 질문(FAQ)",
      desc: "실습 중 자주 나오는 질문과 답변을 모았습니다.",
      cta: "질문 보기",
    },
    {
      phase: "always",
      href: "/institutions",
      icon: "fa-solid fa-hospital",
      color: "emerald",
      title: "실습기관 정보",
      desc: "실습기관의 위치와 연락처, 안내 사항을 확인하세요.",
      cta: "기관 보기",
    },
  ],
  checklist: [
    "방문간호 가방 오염 방지용 신문지/매트 챙기기",
    "K-ADL / K-IADL 노인 기능 사정 도구 숙지",
    "BPRS 우선순위 산출 공식 (A+2B)×C 복습",
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
