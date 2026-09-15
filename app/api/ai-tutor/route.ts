import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION =
  "당신은 한국의 간호대학생들을 가르치는 친절하고 전문적인 지역사회간호학 임상실습 튜터입니다. 답변 시 OMAHA 체계, BPRN, 방문간호 지침을 명확히 설명해 주세요.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
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

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini API 호출 실패:", error);
    return NextResponse.json({ error: "AI 튜터 응답 중 오류가 발생했습니다." }, { status: 502 });
  }
}
