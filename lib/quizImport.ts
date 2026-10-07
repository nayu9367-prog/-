import type { QuizQuestionInput } from "@/lib/quiz";

export const MAX_IMPORT_PDF_MB = 20;
export const MAX_IMPORT_QUESTIONS = 200;

const EXTRACTION_INSTRUCTION = [
  "첨부된 PDF는 간호학 객관식 문제집입니다. PDF에 있는 객관식 문제를 처음부터 끝까지 빠짐없이, 적힌 순서대로 추출하세요.",
  "문제, 보기, 해설의 문장은 PDF에 적힌 그대로 옮기고, 요약하거나 고쳐 쓰거나 새로 만들지 마세요.",
  "question에는 문제 번호(예: '1.', '문제 3')를 빼고 문제 문장만 넣으세요.",
  "options에는 보기를 순서대로 넣되, 보기 앞의 번호나 기호(①, 1), 가. 등)는 빼세요.",
  "answerNumber에는 PDF에 표시된 정답 보기가 몇 번째인지 1부터 세어 넣으세요. PDF에 정답이 없으면 0을 넣고, 정답을 추측하지 마세요.",
  "explanation에는 PDF에 적힌 해설을 넣으세요. PDF에 해설이 없으면 빈 문자열을 넣고, 해설을 지어내지 마세요.",
  "정답과 해설이 문제 바로 아래가 아니라 문서 끝의 정답표에 따로 있으면, 문제 번호로 짝을 맞춰 넣으세요.",
].join("\n");

const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      question: { type: "STRING" },
      options: { type: "ARRAY", items: { type: "STRING" } },
      answerNumber: { type: "INTEGER" },
      explanation: { type: "STRING" },
    },
    required: ["question", "options", "answerNumber", "explanation"],
  },
};

// The quiz UI prints its own "1. " before each option, so a marker left in
// the text by the model would show up twice.
function stripOptionMarker(value: string): string {
  return value.replace(/^\s*(?:[①-⑳]|\(?\d{1,2}[).]|[가-하][.)])\s*/, "").trim();
}

/**
 * Validates one question from an untrusted source (the model's output or a
 * request body). Returns null when it can't be used as-is.
 */
export function normalizeQuizQuestionInput(item: unknown): QuizQuestionInput | null {
  if (typeof item !== "object" || item === null) return null;
  const rec = item as Record<string, unknown>;
  const question = typeof rec.question === "string" ? rec.question.trim() : "";
  const options = Array.isArray(rec.options)
    ? rec.options
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
  const answer = Number.isInteger(rec.answer) ? (rec.answer as number) : -1;
  const explanation = typeof rec.explanation === "string" ? rec.explanation.trim() : "";

  if (!question || options.length < 2 || answer < 0 || answer >= options.length || !explanation) {
    return null;
  }
  return { question, options, answer, explanation };
}

export type QuizImportResult = {
  questions: QuizQuestionInput[];
  // Questions found in the PDF but left out because the answer or
  // explanation was missing or didn't line up with the options.
  skippedCount: number;
};

export class QuizImportError extends Error {}

export async function extractQuizQuestionsFromPdf(pdf: Buffer): Promise<QuizImportResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new QuizImportError("AI API 키(GEMINI_API_KEY)가 설정되지 않아 PDF를 읽을 수 없습니다.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } },
            { text: "이 PDF의 객관식 문제를 모두 추출해 주세요." },
          ],
        },
      ],
      systemInstruction: { parts: [{ text: EXTRACTION_INSTRUCTION }] },
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 429) {
      throw new QuizImportError(
        "지금은 AI 사용 한도를 모두 써서 PDF를 읽을 수 없습니다. 잠시 후 또는 내일 다시 시도해 주세요."
      );
    }
    throw new QuizImportError(data?.error?.message || `Gemini API 오류 (${response.status})`);
  }

  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new QuizImportError(
      "PDF의 문제가 너무 많아 한 번에 읽지 못했습니다. PDF를 나눠서 올려주세요."
    );
  }

  let items: unknown;
  try {
    const text = (candidate?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join("");
    items = JSON.parse(text);
  } catch {
    throw new QuizImportError("AI가 PDF에서 문제를 읽지 못했습니다. 다시 시도해주세요.");
  }
  if (!Array.isArray(items)) {
    throw new QuizImportError("AI가 PDF에서 문제를 읽지 못했습니다. 다시 시도해주세요.");
  }

  const questions: QuizQuestionInput[] = [];
  let skippedCount = 0;
  for (const item of items.slice(0, MAX_IMPORT_QUESTIONS)) {
    const rec = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const options = Array.isArray(rec.options)
      ? rec.options.map((o) => (typeof o === "string" ? stripOptionMarker(o) : o))
      : rec.options;
    const answerNumber = Number.isInteger(rec.answerNumber) ? (rec.answerNumber as number) : 0;
    const normalized = normalizeQuizQuestionInput({ ...rec, options, answer: answerNumber - 1 });
    if (normalized) questions.push(normalized);
    else skippedCount++;
  }

  return { questions, skippedCount };
}
