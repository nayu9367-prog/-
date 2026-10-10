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
  "/safety": "before",
  "/videos": "before",
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
      phase: "before",
      href: "/safety",
      icon: "fa-solid fa-shield-heart",
      color: "emerald",
      title: "안전·인권·감염관리",
      desc: "사고 보고 절차와 안전관리, 감염관리, 인권보호 수칙을 실습 전에 읽어 주세요.",
      cta: "안내 읽기",
    },
    {
      phase: "before",
      href: "/videos",
      icon: "fa-solid fa-film",
      color: "sky",
      title: "실습 참고 영상",
      desc: "실습을 시작하기 전에 봐 두면 좋은 영상을 모았습니다.",
      cta: "영상 보러 가기",
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
      desc: "사전학습, 지역보건의료기관, OMAHA, AI 사례 중 주제를 골라 너시에게 질문해 보세요.",
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
      desc: "다음 조를 위해 실습기관별 인계 자료(PDF)를 올리고, 앞 조가 올린 자료를 확인하세요.",
      cta: "인계사항 보기",
    },
    {
      phase: "after",
      href: "/survey/post",
      icon: "fa-solid fa-clipboard-check",
      color: "amber",
      title: "실습 만족도 조사",
      desc: "실습을 마친 뒤 만족도와 의견을 들려주세요.",
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
  // A line starting with "#" is a group title.
  checklist: [
    "# 학습 준비",
    "사전학습 완료",
    "핵심술기 동영상 시청",
    "실습목표 및 일정, 평가기준 확인",
    "사전 요구도 조사 응답",
    "# 복장 및 준비물",
    "단정한 복장 준비 (랩가운, 명찰, 머리망 등)",
    "개인 준비물 확인 (필기구, 수첩, 마스크 등)",
    "실습기관별 추가 준비물 확인 (예: 방문가방, 손소독제 등)",
    "# 실습기관 사전 확인",
    "실습기관 위치, 교통편, 소요시간 확인",
    "집합 장소, 시간, 담당자 연락처 확인",
    "실습기관별 주의사항 확인",
    "지각, 결석, 응급 시 연락방법 숙지 (OT 자료 및 실습지침서 확인)",
    "# 실습 시 안전 및 윤리사항",
    "감염관리 수칙 숙지 (손위생 등)",
    "대상자 정보 보호 숙지 (목적 외 열람, 촬영, 저장 금지)",
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
