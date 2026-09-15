export type SkillCategory = "visit" | "edu" | "check";

export type Skill = {
  id: number;
  cat: SkillCategory;
  tag: string;
  title: string;
  desc: string;
  youtubeId: string;
  steps: string[];
};

export const skillCategories: { id: SkillCategory | "all"; label: string }[] = [
  { id: "all", label: "전체보기" },
  { id: "visit", label: "방문간호" },
  { id: "edu", label: "보건교육" },
  { id: "check", label: "건강사정" },
];

export const skillsData: Skill[] = [
  {
    id: 0,
    cat: "visit",
    tag: "방문간호",
    title: "방문간호 가방(Nurse Bag) 세팅 및 오염 방지 감염 관리",
    desc: "가정 방문 시 청결구역과 오염구역 구분, 물품 준비 및 바닥 깔개(신문지/매트) 배치 지침",
    youtubeId: "5D8_S69Qj1g",
    steps: [
      "방문간호 가방을 손위생 후 준비하고, 청결 구역과 오염 구역을 구분하여 물품을 채웁니다.",
      "대상자 가정 방문 시 가방을 바닥이나 침대 위에 직접 놓지 않고 신문지/비닐 매트를 깔고 그 위에 놓습니다.",
      "물품 사용 전후 반드시 알코올 손소독제로 손위생을 실시합니다.",
      "사용한 오염 물품(소독솜, 체온계 캡 등)은 오염 전용 비닐봉투에 격리하여 수거합니다.",
    ],
  },
  {
    id: 1,
    cat: "check",
    tag: "건강사정",
    title: "노인 일상생활수행능력(K-ADL & K-IADL) 평가법",
    desc: "재가 노인 대상 옷 입기, 세수, 식사, 대중교통 이용, 약 챙겨 먹기 등 사정 절차",
    youtubeId: "5D8_S69Qj1g",
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
    youtubeId: "5D8_S69Qj1g",
    steps: [
      "도입(3분): 대상자의 평소 식습관 및 국물 섭취 습관 질문을 통해 흥미를 유발합니다.",
      "전개(9분): 국물 염도 측정법 시연, 1일 소금 섭취 권장량(5g) 교구를 활용해 설명합니다.",
      "정리(3분): 3가지 핵심 수칙(국물 적게 마시기, 싱겁게 먹기, 약 제때 먹기)을 복습하고 퀴즈로 확인합니다.",
    ],
  },
];
