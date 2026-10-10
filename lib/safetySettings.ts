import { neon } from "@neondatabase/serverless";

// The icons an admin can pick for a card, by what they depict.
export const SAFETY_ICONS = [
  { value: "fa-solid fa-circle-info", label: "안내" },
  { value: "fa-solid fa-triangle-exclamation", label: "주의" },
  { value: "fa-solid fa-shield-halved", label: "안전" },
  { value: "fa-solid fa-file-signature", label: "서명·확인증" },
  { value: "fa-solid fa-fire-extinguisher", label: "화재" },
  { value: "fa-solid fa-user-shield", label: "보호" },
  { value: "fa-solid fa-stethoscope", label: "건강검진" },
  { value: "fa-solid fa-syringe", label: "주사·예방접종" },
  { value: "fa-solid fa-hands-bubbles", label: "손 씻기" },
  { value: "fa-solid fa-head-side-mask", label: "보호구" },
  { value: "fa-solid fa-biohazard", label: "감염성 폐기물" },
  { value: "fa-solid fa-faucet-drip", label: "세척" },
  { value: "fa-solid fa-scale-balanced", label: "인권" },
  { value: "fa-solid fa-handshake", label: "존중" },
  { value: "fa-solid fa-kit-medical", label: "응급처치" },
  { value: "fa-solid fa-comments", label: "보고" },
  { value: "fa-solid fa-building-columns", label: "대학·행정" },
  { value: "fa-solid fa-user-injured", label: "사고자" },
  { value: "fa-solid fa-user-nurse", label: "간호학과" },
  { value: "fa-solid fa-file-invoice-dollar", label: "보험" },
  { value: "fa-solid fa-phone", label: "연락" },
] as const;

export const DEFAULT_SAFETY_ICON = SAFETY_ICONS[0].value;

export function isSafetyIcon(value: unknown): value is string {
  return SAFETY_ICONS.some((icon) => icon.value === value);
}

// The guide is read one tab at a time, in this order.
export const SAFETY_TABS = [
  { key: "report", label: "사고 보고 절차", icon: "fa-solid fa-truck-medical" },
  { key: "safety", label: "안전관리", icon: "fa-solid fa-shield-halved" },
  { key: "infection", label: "감염관리", icon: "fa-solid fa-hands-bubbles" },
  { key: "rights", label: "인권보호", icon: "fa-solid fa-scale-balanced" },
] as const;

export type SafetyTabKey = (typeof SAFETY_TABS)[number]["key"];

// A tab holds one or more blocks of cards. The pictures come from the
// course's slide deck and ship with the site; the cards are what an admin
// edits.
export const SAFETY_BLOCKS = [
  {
    key: "steps",
    tab: "report",
    heading: "안전 및 감염사고 단계별 보고 절차",
    image: "/safety/report-steps.jpg",
    imageWidth: 748,
    imageHeight: 636,
  },
  {
    key: "roles",
    tab: "report",
    heading: "주체별 역할 및 조치사항",
    image: "/safety/report-roles.jpg",
    imageWidth: 976,
    imageHeight: 602,
  },
  { key: "safety", tab: "safety", heading: "안전관리" },
  { key: "infection", tab: "infection", heading: "감염관리" },
  { key: "rights", tab: "rights", heading: "인권보호" },
] as const satisfies readonly {
  key: string;
  tab: SafetyTabKey;
  heading: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
}[];

export type SafetyBlockKey = (typeof SAFETY_BLOCKS)[number]["key"];

export type SafetyItem = {
  icon: string;
  title: string;
  desc: string;
};

export type SafetySettings = {
  blocks: Record<SafetyBlockKey, SafetyItem[]>;
  // The slide deck itself, for students who want the file.
  fileUrl?: string;
  fileName?: string;
};

const SETTINGS_KEY = "safety";

export const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  blocks: {
    steps: [
      {
        icon: "fa-solid fa-kit-medical",
        title: "1단계: 사고 발생 및 응급 진료",
        desc: "현장 응급처치 후 필요시 해당 실습기관 응급실 또는 감염내과 진료를 받습니다.",
      },
      {
        icon: "fa-solid fa-comments",
        title: "2단계: 현장지도자 및 실습담당교수 보고",
        desc: "사고 경위를 파악하고 실습담당교수가 사건보고서를 작성합니다.",
      },
      {
        icon: "fa-solid fa-building-columns",
        title: "3단계: 학과 및 대학 행정부서 보고",
        desc: "실습지원팀장과 학과장을 거쳐 학생취업처로 보고되어 서류, 비용, 추후관리가 진행됩니다.",
      },
    ],
    roles: [
      {
        icon: "fa-solid fa-user-injured",
        title: "사고자 또는 최초발견자",
        desc: "응급처치 및 병원 진료를 실시하고 사고 경위 파악 후 지도교수에게 보고합니다.",
      },
      {
        icon: "fa-solid fa-user-nurse",
        title: "간호학과",
        desc: "응급조치, 학과 보고, 경위 파악, 필요시 학부모 연락 및 학생 추후관리를 담당합니다.",
      },
      {
        icon: "fa-solid fa-file-invoice-dollar",
        title: "학생취업처",
        desc: "계약된 보험사에 보험을 청구하고 학생의 추후 경과를 관리합니다.",
      },
    ],
    safety: [
      {
        icon: "fa-solid fa-file-signature",
        title: "실습 전 안전교육 OT 이수 및 서명",
        desc: "매 학기 실습 전 안전 및 감염관리 교육을 이수한 후 감염예방관리 교육 이수확인 등에 서명합니다.",
      },
      {
        icon: "fa-solid fa-fire-extinguisher",
        title: "화재 대응 3단계",
        desc: "① 신고 및 전파\n② 소화\n③ 피난 유도: 경환자, 중환자 순으로 비상계단을 이용하여 자세를 최대한 낮추고 코와 입을 물수건으로 가린 채 대피합니다.",
      },
      {
        icon: "fa-solid fa-user-shield",
        title: "성희롱 예방 및 발생 시 즉시 보고·보호",
        desc: "실습 중 성희롱 발생 시 명확하게 거절 의사를 표현하고 현장을 벗어난 후 현장지도자 및 실습지도교수에게 즉시 보고하며 보호조치를 받습니다.",
      },
    ],
    infection: [
      {
        icon: "fa-solid fa-stethoscope",
        title: "실습 전 건강검진 및 예방접종 실시",
        desc: "감염성 질환과 흉부 X-ray 검사 이상 여부를 확인하고, 필요한 예방접종을 미리 실시합니다.",
      },
      {
        icon: "fa-solid fa-hands-bubbles",
        title: "올바른 손 씻기",
        desc: "감염 예방을 위해 흐르는 물에 비누를 사용하는 올바른 손 씻기를 숙지하고 실무에서 철저히 시행합니다.",
      },
      {
        icon: "fa-solid fa-head-side-mask",
        title: "개인보호구 착용",
        desc: "체액이나 오염 방지 및 미생물 전파 차단을 위해 장갑, 가운, 마스크 등 보호장구를 올바르게 착용합니다.",
      },
      {
        icon: "fa-solid fa-syringe",
        title: "주사침 찔림 예방 및 안전 폐기",
        desc: "사용한 주삿바늘은 뚜껑을 다시 씌우거나 구부리지 않고 전용 수거함에 폐기합니다. 찔림 사고 발생 시 즉시 간호사에게 보고하고 감염 여부를 확인합니다.",
      },
      {
        icon: "fa-solid fa-faucet-drip",
        title: "감염 물질 노출 시 15분 세척 응급조치",
        desc: "상처나 눈, 점막이 환자의 혈액, 체액에 노출된 경우 담당 간호사에게 보고 후 생리식염수로 15분간 즉시 세척하고 대학 및 기관의 지침에 따라 후속 조치합니다.",
      },
    ],
    rights: [
      {
        icon: "fa-solid fa-file-signature",
        title: "인권교육 이수 확인증 서명",
        desc: "실습 전 인권보호 교육을 이수한 후 교육 이수 확인증에 서명하여 인권보호의 중요성을 명확히 인식합니다.",
      },
      {
        icon: "fa-solid fa-handshake",
        title: "상호 인권 존중 수칙 준수",
        desc: "인권의 개념을 정확히 이해하고, 실습 현장에서 자신과 타인의 인권이 침해받지 않도록 인권 존중 수칙을 준수합니다.",
      },
    ],
  },
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

export async function getSafetySettings(): Promise<SafetySettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: Partial<SafetySettings> }[];
  const saved = rows[0]?.value;
  if (!saved) return DEFAULT_SAFETY_SETTINGS;
  // A block added to the guide after the last save has nothing stored yet.
  return { ...saved, blocks: { ...DEFAULT_SAFETY_SETTINGS.blocks, ...saved.blocks } };
}

export async function updateSafetySettings(value: SafetySettings): Promise<SafetySettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: SafetySettings }[];
  return rows[0].value;
}
