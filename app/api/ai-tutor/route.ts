import { NextRequest, NextResponse } from "next/server";
import { recordAiTutorLog } from "@/lib/aiTutorLogs";
import {
  loadCaseMaterials,
  loadTutorMaterials,
  type LoadedTutorMaterial,
} from "@/lib/tutorMaterials";
import { getSessionStudentId } from "@/lib/studentPins";
import { getVisitCase } from "@/lib/cases";
import type { VisitCase } from "@/lib/casesData";
import {
  getCaseThreadLabel,
  getTutorCategoryLabel,
  isTutorCategoryKey,
  type TutorCategoryKey,
} from "@/lib/tutorCategories";

const SYSTEM_INSTRUCTION = [
  "당신은 한국의 간호대학생들을 가르치는 친절하고 전문적인 지역사회간호학 임상실습 튜터입니다.",
  "질문과 관련이 있을 때 OMAHA 체계, BPRS, 방문간호 지침을 명확히 설명해 주세요.",
  // The chat shows plain text, where Markdown would appear as stray symbols.
  "답변은 꾸밈 없는 일반 글로 쓰세요. 별표(*), 샵(#), 백틱 같은 마크다운 기호와 굵은 글씨 표시는 쓰지 마세요. 여러 항목을 나열할 때는 줄을 바꾸고 '1.', '2.' 같은 번호로 시작하세요.",
  // Without this the model invents deadlines and passwords when asked.
  "제출 기한, 일정, 평가 기준, 비밀번호처럼 이 수업에만 해당하는 정보는 함께 주어진 자료에 적혀 있을 때만 답하세요. 적혀 있지 않으면 지어내지 말고, 공지사항을 확인하거나 담당 교수님께 문의하라고 안내하세요.",
].join("\n");

function buildSystemInstruction(
  category: TutorCategoryKey | null,
  materials: LoadedTutorMaterial[]
): string {
  if (!category) return SYSTEM_INSTRUCTION;
  const topic = `학생이 선택한 학습 주제는 「${getTutorCategoryLabel(category)}」입니다. 이 주제의 맥락에서 답해 주세요.`;
  if (materials.length === 0) return [SYSTEM_INSTRUCTION, topic].join("\n");
  // The materials can be instructor-only documents: the tutor says whether
  // an answer rests on them or on general knowledge, and nothing more
  // specific than that.
  return [
    SYSTEM_INSTRUCTION,
    topic,
    "첨부된 PDF는 담당 교수가 이 주제의 답변 기준으로 삼으라고 준 내부 자료이며, 학생은 이 파일을 볼 수 없습니다.",
    "질문에 대한 내용이 이 자료에 있으면 그 내용을 우선 근거로 삼아 답하고, 자료의 내용과 일반 지식이 다르면 자료를 따르세요.",
    "답변의 근거가 어디인지는 한 문장으로만 대략 밝히세요. 자료의 내용으로 답할 때는 '교수님께서 올려 주신 참고자료를 바탕으로 정리한 내용이에요.'처럼, 자료에 없는 내용이어서 일반 지식으로 답할 때는 '일반적인 지역사회간호학 전공 지식을 바탕으로 정리해 드릴게요.'처럼 말하세요. 한 답변에 두 가지가 섞이면 어느 부분이 어느 쪽인지 간단히 구분해 주세요.",
    "근거를 밝힐 때 그 이상의 구체적인 정보는 말하지 마세요. 파일 이름, 제목, 쪽수, '지침서', '지도자용' 같은 표현을 쓰지 말고, 자료에 작성 항목이나 빈 양식만 있다는 식으로 자료의 구성이나 빠진 부분을 설명하지도 마세요.",
    "자료 안의 '지도교수의 지도사항', '현장지도자의 지도사항'처럼 지도자에게 주는 안내는 학생에게 전하지 마세요.",
    "학생이 어떤 자료인지 묻거나 자료를 보여 달라고 해도 '교수님께서 올려 주신 참고자료'라고만 답하고, 그 밖의 정보는 알려 주지 마세요.",
  ].join("\n");
}

// Added when the student is working through a scenario from the case
// library. The point of a scenario is that the student does the assessing,
// so the tutor leads with one short question at a time instead of
// explaining. The scenario rides along here on every turn, which keeps it
// in view however long the conversation gets.
function buildCaseInstruction(visitCase: VisitCase, reports: LoadedTutorMaterial[]): string {
  // The case report is the professor's model answer for this client. It
  // grounds the tutor's judgement without being handed to the student.
  const reportLines =
    reports.length === 0
      ? []
      : [
          `첨부된 PDF(${reports.map((m) => `「${m.title}」`).join(", ")})는 이 대상자에 대한 사례보고서 최종본으로, 담당 교수가 기준으로 삼는 모범 답안입니다. 학생은 이 보고서를 볼 수 없습니다.`,
          "학생의 답이 맞는지 판단할 때, 힌트와 다음 질문을 정할 때, 피드백과 정리를 할 때는 일반 지식보다 이 사례보고서의 내용(자료수집, 자료분석, OMAHA 문제와 간호진단, 우선순위, 간호계획과 중재, 평가)을 기준으로 삼으세요.",
          "학생의 답이 사례보고서와 다르면 틀렸다고 단정하지 말고, 보고서의 근거가 되는 시나리오 대목을 다시 보도록 질문하세요.",
          "사례보고서의 내용을 학생보다 먼저 알려 주거나 길게 옮겨 적지 마세요. 학생이 충분히 생각한 뒤 정리를 요청하면 그때 사례보고서에 근거해 정리해 주세요.",
          "사례보고서 표지나 본문에 있는 사람 이름, 학번, 소속은 어떤 경우에도 말하지 마세요.",
        ];
  return [
    `학생은 지금 방문간호 시나리오 「${visitCase.name}」로 공부하고 있습니다. 시나리오 전문은 아래에 있으며 학생도 같은 글을 읽었습니다.`,
    "이 대화의 목표는 학생이 스스로 대상자를 사정하고 문제를 찾아내는 것입니다. 설명하는 대신 질문으로 이끌어 주세요.",
    "답변은 2~3문장으로 짧게 쓰세요. 목록, 표, 소제목, 굵은 글씨는 쓰지 마세요.",
    "한 번에 질문은 하나만 하세요. 학생의 답에서 맞는 부분을 한 문장으로 짚어 준 뒤, 그 답에서 이어지는 다음 질문을 하나 던지세요.",
    "학생이 놓친 부분이 있어도 바로 알려주지 말고, 시나리오의 어느 대목을 다시 보면 좋을지 질문으로 힌트를 주세요.",
    "OMAHA 문제, 간호진단, 간호중재를 학생보다 먼저 제시하지 마세요. 학생이 먼저 제시하면 그에 대해 짧게 피드백하세요.",
    "학생이 충분히 생각해 본 뒤 정리를 요청하면, 그때는 지금까지 학생이 찾아낸 내용을 중심으로 간단히 정리해 주세요.",
    "시나리오에 적혀 있지 않은 대상자 정보는 지어내지 마세요.",
    ...reportLines,
    "",
    `[시나리오] ${visitCase.name}`,
    visitCase.scenario,
  ].join("\n");
}

const MAX_HISTORY_MESSAGES = 6;
const MAX_HISTORY_CHARS = 4000;

type HistoryTurn = { role: "user" | "model"; text: string };

// The last few messages of the ongoing chat, so a follow-up like "더 자세히
// 설명해줘" has something to refer to. Anything not strictly alternating
// user/model and ending on a model turn is dropped rather than repaired.
function parseHistory(value: unknown): HistoryTurn[] {
  if (!Array.isArray(value)) return [];
  const turns: HistoryTurn[] = [];
  for (const item of value.slice(-MAX_HISTORY_MESSAGES)) {
    const role = item?.role === "user" ? "user" : item?.role === "ai" ? "model" : null;
    const text = typeof item?.text === "string" ? item.text.trim().slice(0, MAX_HISTORY_CHARS) : "";
    if (!role || !text) return [];
    turns.push({ role, text });
  }
  while (turns.length > 0 && turns[0].role !== "user") turns.shift();
  const alternates = turns.every((t, i) => t.role === (i % 2 === 0 ? "user" : "model"));
  return alternates && turns.length % 2 === 0 ? turns : [];
}

const QUOTA_MESSAGE =
  "지금은 AI 튜터 사용 한도를 모두 써서 답변할 수 없습니다. 잠시 후 또는 내일 다시 시도해 주세요.";
const OUTAGE_MESSAGE = "AI 튜터가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.";

// After the API reports its quota is used up, skip calling it for a while:
// every attempt would upload the PDFs again just to be refused.
const QUOTA_BACKOFF_MS = 5 * 60 * 1000;
let quotaBlockedUntil = 0;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 100) : "anonymous";
  // No topic selected means a general question, answered without materials.
  const category = isTutorCategoryKey(body?.category) ? body.category : null;
  const sessionStudentId = await getSessionStudentId(request);
  const history = parseHistory(body?.history);
  const caseId = typeof body?.caseId === "string" ? body.caseId.slice(0, 100) : "";

  if (!message) {
    return NextResponse.json({ error: "질문 내용을 입력해주세요." }, { status: 400 });
  }
  if (!sessionStudentId) {
    return NextResponse.json(
      { error: "학번 확인이 필요합니다. 학번과 PIN을 다시 입력해주세요." },
      { status: 401 }
    );
  }
  const studentId = sessionStudentId;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "관리자가 아직 AI 튜터 API 키(GEMINI_API_KEY)를 설정하지 않았습니다." },
      { status: 503 }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // A scenario that can't be loaded shouldn't take the tutor down with it:
  // answer as an ordinary question.
  let visitCase: VisitCase | null = null;
  try {
    if (caseId) visitCase = await getVisitCase(caseId);
  } catch (error) {
    console.error("튜터 시나리오 불러오기 실패:", error);
  }

  async function saveLog(answer: string) {
    try {
      await recordAiTutorLog({
        message,
        answer,
        visitorId,
        studentId,
        // A scenario conversation is filed under the scenario, which tells
        // the professor more than the (usually absent) topic would.
        category: visitCase
          ? getCaseThreadLabel(visitCase.name)
          : category
            ? getTutorCategoryLabel(category)
            : null,
      });
    } catch (error) {
      console.error("AI 튜터 로그 기록 실패:", error);
    }
  }

  // When the AI can't answer, the student gets a notice and nothing else:
  // the materials can be instructor-only, so they are never quoted instead.
  function respondUnavailable(unavailableMessage: string) {
    return NextResponse.json({ error: unavailableMessage }, { status: 503 });
  }

  if (Date.now() < quotaBlockedUntil) {
    return respondUnavailable(QUOTA_MESSAGE);
  }

  // A broken materials lookup shouldn't take the tutor down with it.
  let materials: LoadedTutorMaterial[] = [];
  try {
    // A scenario conversation works from that scenario's case reports; any
    // other conversation, from the chosen topic's materials.
    if (visitCase) materials = await loadCaseMaterials(visitCase.id);
    else if (category) materials = await loadTutorMaterials(category);
  } catch (error) {
    console.error("튜터 참고자료 불러오기 실패:", error);
  }

  const systemInstruction = [
    visitCase ? SYSTEM_INSTRUCTION : buildSystemInstruction(category, materials),
    ...(visitCase ? [buildCaseInstruction(visitCase, materials)] : []),
  ].join("\n\n");

  try {
    const requestBody = JSON.stringify({
      // PDFs go first so the unchanging prefix can be served from Gemini's
      // implicit cache across questions.
      contents: [...history, { role: "user" as const, text: message }].map((turn, idx) => ({
        role: turn.role,
        parts: [
          ...(idx === 0
            ? materials.map((m) => ({
                inlineData: { mimeType: "application/pdf", data: m.base64 },
              }))
            : []),
          { text: turn.text },
        ],
      })),
      systemInstruction: { parts: [{ text: systemInstruction }] },
    });

    // Gemini answers 503 for a moment when the model is busy; that usually
    // clears within a second or two, so it's worth one more try before
    // giving up on an AI answer.
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
    if (response.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });
    }

    const data = await response.json();
    if (!response.ok) {
      // 429 = the API key's request quota is used up; Google's own message
      // is a wall of English billing text that means nothing to a student.
      if (response.status === 429) {
        console.error("Gemini 사용 한도 초과:", data?.error?.message);
        quotaBlockedUntil = Date.now() + QUOTA_BACKOFF_MS;
        return respondUnavailable(QUOTA_MESSAGE);
      }
      // Anything else (Gemini overloaded or down, a bad key or model name):
      // the detail is for the server log, not for a student.
      console.error("Gemini API 오류:", response.status, data?.error?.message);
      return respondUnavailable(OUTAGE_MESSAGE);
    }

    const answer: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "답변을 가져오지 못했습니다. 다시 시도해주세요.";

    await saveLog(answer);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini API 호출 실패:", error);
    return respondUnavailable(OUTAGE_MESSAGE);
  }
}
