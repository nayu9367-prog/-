export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const quizData: QuizQuestion[] = [
  {
    question: "1. BPRN(Basic Priority Rating System) 우선순위 결정 공식으로 옳은 것은?",
    options: ["(A + B) × C", "(A + 2B) × C", "(2A + B) × C", "(A + B) + 2C"],
    answer: 1,
    explanation:
      "BPRN 공식은 (A + 2B) × C 입니다. (A: 문제의 크기, B: 문제의 심각도, C: 사업의 추정 효과)",
  },
  {
    question: "2. OMAHA 간호진단 체계의 4대 영역(Domain)에 해당하지 않는 것은?",
    options: [
      "환경 영역 (Environmental)",
      "사회심리 영역 (Psychosocial)",
      "생리 영역 (Physiological)",
      "신체검진 영역 (Physical Exam)",
    ],
    answer: 3,
    explanation:
      "OMAHA 체계의 4대 영역은 1) 환경 영역, 2) 사회심리 영역, 3) 생리 영역, 4) 건강관련 행위 영역입니다.",
  },
  {
    question: "3. 방문간호 가방(Nurse Bag) 사용 시 감염 관리를 위한 수칙으로 올바른 것은?",
    options: [
      "가방은 대상자의 침대 위나 바닥에 직접 올려놓는다.",
      "가방을 놓기 전 깨끗한 신문지나 매트를 바닥에 깔고 놓는다.",
      "가방 내부 물품은 청결 구역 구분 없이 자유롭게 채워 넣는다.",
      "사용한 침 및 오염물품은 가방 안 청결 구역에 보관한다.",
    ],
    answer: 1,
    explanation:
      "방문간호 시 가방 오염을 방지하기 위해 바닥에 신문지/비닐 매트를 깔고 놓으며, 청결구역과 오염구역을 명확히 구분합니다.",
  },
  {
    question: "4. 보건교육 계획안 작성 시 3단계 구조의 올바른 순서는?",
    options: [
      "도입 - 전개 - 정리",
      "기획 - 수행 - 평가",
      "사정 - 진단 - 계획",
      "문제제기 - 분석 - 결론",
    ],
    answer: 0,
    explanation:
      "보건교육은 '도입(흥미 유발) - 전개(핵심 내용 전달 및 시연) - 정리(요약 및 평가)'의 3단계 구조로 진행됩니다.",
  },
  {
    question: "5. 지역보건법상 보건소의 설치 기준에 대한 설명으로 옳은 것은?",
    options: [
      "읍·면·동마다 1개소씩 설치한다.",
      "시·군·구마다 1개소씩 설치한다.",
      "도 단위마다 1개소씩 설치한다.",
      "인구 50만 명당 1개소씩 설치한다.",
    ],
    answer: 1,
    explanation:
      "지역보건법에 따라 보건소는 대통령령으로 정하는 기준에 따라 시·군·구별로 1개소씩 설치합니다.",
  },
];
