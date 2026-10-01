import { NextRequest, NextResponse } from "next/server";
import { recordAiTutorLog } from "@/lib/aiTutorLogs";
import { loadTutorMaterials, type LoadedTutorMaterial } from "@/lib/tutorMaterials";

const SYSTEM_INSTRUCTION =
  "당신은 한국의 간호대학생들을 가르치는 친절하고 전문적인 지역사회간호학 임상실습 튜터입니다. 답변 시 OMAHA 체계, BPRN, 방문간호 지침을 명확히 설명해 주세요.";

function buildSystemInstruction(materials: LoadedTutorMaterial[]): string {
  if (materials.length === 0) return SYSTEM_INSTRUCTION;
  const titles = materials.map((m) => `「${m.title}」`).join(", ");
  return [
    SYSTEM_INSTRUCTION,
    `첨부된 PDF(${titles})는 담당 교수가 제공한 실습 참고자료입니다.`,
    "질문에 대한 내용이 참고자료에 있으면 그 내용을 우선 근거로 삼아 답하고, 어느 자료에 근거했는지 자료 이름을 밝혀 주세요.",
    "참고자료에 없는 내용이면 '제공된 참고자료에는 없는 내용'이라고 먼저 밝힌 뒤 일반적인 지역사회간호학 지식으로 답해 주세요.",
    "참고자료의 내용과 일반 지식이 다르면 참고자료를 따르세요.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 100) : "anonymous";

  if (!message) {
    return NextResponse.json({ error: "질문 내용을 입력해주세요." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "관리자가 아직 AI 튜터 API 키(GEMINI_API_KEY)를 설정하지 않았습니다." },
      { status: 503 }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // A broken materials lookup shouldn't take the tutor down with it.
  let materials: LoadedTutorMaterial[] = [];
  try {
    materials = await loadTutorMaterials();
  } catch (error) {
    console.error("튜터 참고자료 불러오기 실패:", error);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // PDFs go first so the unchanging prefix can be served from Gemini's
        // implicit cache across questions.
        contents: [
          {
            parts: [
              ...materials.map((m) => ({
                inlineData: { mimeType: "application/pdf", data: m.base64 },
              })),
              { text: message },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: buildSystemInstruction(materials) }] },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const detail = data?.error?.message || `Gemini API 오류 (${response.status})`;
      return NextResponse.json({ error: detail }, { status: 502 });
    }

    const answer: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "답변을 가져오지 못했습니다. 다시 시도해주세요.";

    try {
      await recordAiTutorLog(message, answer, visitorId);
    } catch (error) {
      console.error("AI 튜터 로그 기록 실패:", error);
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini API 호출 실패:", error);
    return NextResponse.json({ error: "AI 튜터 응답 중 오류가 발생했습니다." }, { status: 502 });
  }
}
