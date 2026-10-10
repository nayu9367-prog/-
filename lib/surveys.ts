import { neon } from "@neondatabase/serverless";

// The surveys students answer before the practicum (needs) and after it
// (satisfaction).
export const SURVEY_KEYS = ["pre", "post"] as const;
export type SurveyKey = (typeof SURVEY_KEYS)[number];

export function isSurveyKey(value: unknown): value is SurveyKey {
  return SURVEY_KEYS.some((key) => key === value);
}

export const SURVEY_LABELS: Record<SurveyKey, string> = {
  pre: "사전 요구도 조사",
  post: "실습 만족도 조사",
};

export type SurveyChoiceQuestion = { question: string; options: string[] };

export type Survey = {
  intro: string;
  // Closed surveys show a "not open yet" notice instead of the form.
  open: boolean;
  choiceQuestions: SurveyChoiceQuestion[];
  // Blank means the survey has no written question.
  textQuestion: string;
};

export type SurveySettings = Record<SurveyKey, Survey>;

export type SurveyResponse = {
  // The chosen option's position for each choice question, in order.
  choices: number[];
  text: string;
  submittedAt: string;
};

export const MAX_SURVEY_CHOICE_QUESTIONS = 20;
export const MAX_SURVEY_OPTIONS = 10;
export const MAX_SURVEY_TEXT_LENGTH = 2000;

const DEFAULT_OPTIONS = ["전혀 그렇지 않다", "그렇지 않다", "보통이다", "그렇다", "매우 그렇다"];

// A starting shape (five choice questions and one written question) for the
// professor to fill in; closed until the real questions are in.
function placeholderSurvey(label: string): Survey {
  return {
    intro: `${label}입니다. 응답은 실습 운영 개선에만 사용됩니다.`,
    open: false,
    choiceQuestions: [1, 2, 3, 4, 5].map((n) => ({
      question: `객관식 문항 ${n} (내용을 입력해 주세요)`,
      options: [...DEFAULT_OPTIONS],
    })),
    textQuestion: "주관식 문항 (내용을 입력해 주세요)",
  };
}

export const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  pre: placeholderSurvey(SURVEY_LABELS.pre),
  post: placeholderSurvey(SURVEY_LABELS.post),
};

const SETTINGS_KEY = "surveys";

function responsesKey(key: SurveyKey): string {
  return `survey-responses:${key}`;
}

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

export async function getSurveySettings(): Promise<SurveySettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: Partial<SurveySettings> }[];
  return { ...DEFAULT_SURVEY_SETTINGS, ...rows[0]?.value };
}

export async function updateSurveySettings(value: SurveySettings): Promise<SurveySettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: SurveySettings }[];
  return rows[0].value;
}

// The surveys are anonymous: responses are kept per survey as one JSON object
// keyed by a random ID, with nothing that says who answered.
export async function getSurveyResponses(key: SurveyKey): Promise<Record<string, SurveyResponse>> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${responsesKey(key)}
  `) as { value: Record<string, SurveyResponse> }[];
  return rows[0]?.value ?? {};
}

export async function saveSurveyResponse(key: SurveyKey, response: SurveyResponse): Promise<void> {
  const sql = getSql();
  // Merged in the database in one statement, so a class submitting at the
  // same moment can't overwrite each other's responses.
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${responsesKey(key)}, ${JSON.stringify({ [crypto.randomUUID()]: response })}::jsonb, ${response.submittedAt})
    ON CONFLICT (key) DO UPDATE
      SET value = site_settings.value || EXCLUDED.value, updated_at = EXCLUDED.updated_at
  `;
}

export async function deleteSurveyResponse(key: SurveyKey, id: string): Promise<void> {
  const sql = getSql();
  // Removed in the database in one statement, for the same reason responses
  // are merged there.
  await sql`
    UPDATE site_settings
    SET value = value - ${id}::text, updated_at = ${new Date().toISOString()}
    WHERE key = ${responsesKey(key)}
  `;
}

export async function clearSurveyResponses(key: SurveyKey): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE site_settings
    SET value = '{}'::jsonb, updated_at = ${new Date().toISOString()}
    WHERE key = ${responsesKey(key)}
  `;
}
