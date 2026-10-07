// The fixed headings every handover note is written under. Edit this list
// to change the form; notes written earlier keep the headings they had.
export const HANDOVER_SECTIONS = [
  { key: "prepare", label: "준비물·복장", placeholder: "꼭 챙겨야 할 준비물, 복장 규정 등" },
  { key: "site", label: "기관 이용 안내", placeholder: "출퇴근 방법, 실습 장소, 점심·휴게 공간, 담당 선생님 등" },
  { key: "work", label: "주요 실습 내용", placeholder: "주로 참여한 사업·활동, 요일별 일정, 과제 진행 요령 등" },
  { key: "caution", label: "주의사항", placeholder: "실수하기 쉬운 점, 기관에서 강조한 점 등" },
  { key: "message", label: "다음 조에게 한마디", placeholder: "다음 실습 조에게 전하고 싶은 말" },
] as const;

export type HandoverSection = { label: string; text: string };

export type HandoverNote = {
  id: string;
  institution: string;
  // Which rotation wrote it, as free text (e.g. "2026-2학기 1조").
  period: string;
  authorName: string;
  sections: HandoverSection[];
  createdAt: string;
};

export const MAX_HANDOVER_TEXT_LENGTH = 1500;
