// The learning topics a student picks from in the AI tutor. Each topic has
// its own set of reference PDFs, registered by the admin.
export const TUTOR_CATEGORIES = [
  { key: "pre-learning", label: "사전학습", icon: "📘" },
  { key: "health-institutions", label: "지역보건의료기관", icon: "🏥" },
  { key: "omaha", label: "OMAHA", icon: "💡" },
] as const;

export type TutorCategoryKey = (typeof TUTOR_CATEGORIES)[number]["key"];

// What a scenario's case report is filed under. Not a topic a student can
// pick: the report is used only in that scenario's "AI 사례" conversation.
// (The value is the key of the former "사례연구" topic, which the reports
// were first stored under.)
export const CASE_REPORT_CATEGORY = "case-study" as const;

export function isTutorCategoryKey(value: unknown): value is TutorCategoryKey {
  return TUTOR_CATEGORIES.some((c) => c.key === value);
}

export function getTutorCategoryLabel(key: TutorCategoryKey): string {
  return TUTOR_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

// What a scenario conversation is filed under in the tutor log. The chat
// uses the same label to tell one scenario's conversation from another's.
export function getCaseThreadLabel(caseName: string): string {
  return `AI 사례 · ${caseName}`;
}
