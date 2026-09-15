import { NextRequest, NextResponse } from "next/server";
import { recordProfessorQuestion } from "@/lib/professorQuestions";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!name || !studentId || !question) {
    return NextResponse.json(
      { error: "이름, 학번, 질문을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    await recordProfessorQuestion(name, studentId, question);
  } catch (error) {
    console.error("질문 DB 저장 실패:", error);
  }

  const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "질문 접수 웹훅(GOOGLE_APPS_SCRIPT_URL)이 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        studentId,
        question,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`웹훅 응답 오류: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Apps Script 웹훅 전송 실패:", error);
    return NextResponse.json(
      { error: "질문 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
