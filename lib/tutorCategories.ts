// The learning topics a student picks from in the AI tutor. Each topic has
// its own set of reference PDFs, registered by the admin.
export const TUTOR_CATEGORIES = [
  { key: "pre-learning", label: "사전학습", icon: "📘" },
  { key: "health-institutions", label: "지역보건의료기관", icon: "🏥" },
  { key: "case-study", label: "사례연구", icon: "📝" },
  { key: "omaha", label: "OMAHA", icon: "💡" },
] as const;

export type TutorCategoryKey = (typeof TUTOR_CATEGORIES)[number]["key"];

export function isTutorCategoryKey(value: unknown): value is TutorCategoryKey {
  return TUTOR_CATEGORIES.some((c) => c.key === value);
}

export function getTutorCategoryLabel(key: TutorCategoryKey): string {
  return TUTOR_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
