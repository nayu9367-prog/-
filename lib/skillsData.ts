export type SkillCategory = "visit" | "edu" | "check" | "skill";

export type VideoProvider = "youtube" | "vimeo";

export type Skill = {
  id: number;
  cat: SkillCategory;
  tag: string;
  title: string;
  desc: string;
  provider: VideoProvider;
  videoId: string;
  steps: string[];
};

export const skillCategories: { id: SkillCategory | "all"; label: string }[] = [
  { id: "all", label: "전체보기" },
  { id: "skill", label: "기본간호술기" },
  { id: "visit", label: "방문간호" },
  { id: "edu", label: "보건교육" },
  { id: "check", label: "건강사정" },
];

export const skillsData: Skill[] = [
  {
    id: 0,
    cat: "skill",
    tag: "기본간호술기",
    title: "피내주사(Intradermal Injection) 시행 방법",
    desc: "주사 부위 선정, 소독, 주사 각도부터 시행 후 팽진(wheal) 관찰까지 기본 간호술기 절차를 안내합니다.",
    provider: "vimeo",
    videoId: "1053660866",
    steps: [
      "처방을 확인하고 5 Right(정확한 환자·약물·용량·경로·시간)를 확인합니다.",
      "손위생을 시행하고 주사기, 알코올 솜, 장갑 등 필요한 물품을 준비합니다.",
      "주사 부위(전완 내측 등)를 알코올 솜으로 소독하고 완전히 마를 때까지 기다립니다.",
      "바늘의 사면(bevel)이 위를 향하게 하여 5~15도 각도로 피부 표면 아래에 얕게 삽입합니다.",
      "약물을 서서히 주입해 팽진(wheal)이 형성되는지 확인하고, 주사 부위는 문지르지 않습니다.",
      "시행 시간을 기록하고 15~20분 후 발적·팽진 크기 등 반응을 관찰합니다.",
    ],
  },
  {
    id: 1,
    cat: "check",
    tag: "건강사정",
    title: "노인 일상생활수행능력(K-ADL & K-IADL) 평가법",
    desc: "재가 노인 대상 옷 입기, 세수, 식사, 대중교통 이용, 약 챙겨 먹기 등 사정 절차",
    provider: "youtube",
    videoId: "5D8_S69Qj1g",
    steps: [
      "대상자에게 개방형 질문으로 일상생활 동작 수행 여부를 관찰하고 문진합니다.",
      "K-ADL(목욕, 옷 입기, 식사, 이동, 화장실 사용, 조절) 항목별 독립성 수준을 평가합니다.",
      "K-IADL(전화 이용, 물건 사기, 음식 준비, 가사, 빨래, 약 복용, 금전 관리 등) 수단적 동작을 체크합니다.",
      "평가 결과를 바탕으로 OMAHA 생리/사회심리 영역 간호진단을 도출합니다.",
    ],
  },
  {
    id: 2,
    cat: "edu",
    tag: "보건교육",
    title: "고혈압·당뇨병 재가 대상자 15분 보건교육 시연",
    desc: "저염 식단 염도계 측정 시연, 복약 이행표 작성법 및 발 관리 보건교육 리플렛 활용법",
    provider: "youtube",
    videoId: "5D8_S69Qj1g",
    steps: [
      "도입(3분): 대상자의 평소 식습관 및 국물 섭취 습관 질문을 통해 흥미를 유발합니다.",
      "전개(9분): 국물 염도 측정법 시연, 1일 소금 섭취 권장량(5g) 교구를 활용해 설명합니다.",
      "정리(3분): 3가지 핵심 수칙(국물 적게 마시기, 싱겁게 먹기, 약 제때 먹기)을 복습하고 퀴즈로 확인합니다.",
    ],
  },
];
