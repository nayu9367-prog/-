"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { VisitCase } from "@/lib/casesData";
import { getVisitorId } from "@/lib/visitorId";
import { loadSavedStudentId, saveStudentId } from "@/lib/studentId";
import { TUTOR_CATEGORIES, type TutorCategoryKey } from "@/lib/tutorCategories";

// "notice" is a local system line (topic switched, earlier history loaded);
// it is shown in the chat but never sent to the AI or saved.
type Message = {
  role: "user" | "ai" | "error" | "notice";
  text: string;
  // Set when the answer quotes the professor's PDFs: links to open them.
  sources?: { title: string; fileUrl: string; page: number }[];
};

type SavedExchange = { id: string; message: string; answer: string };

const HISTORY_PAIRS_SENT = 3;

// The last few completed question/answer pairs, for follow-up questions. A
// question whose answer failed has no pair and is left out.
function recentExchanges(messages: Message[]): { role: "user" | "ai"; text: string }[] {
  const pairs: { role: "user" | "ai"; text: string }[][] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === "user" && messages[i + 1].role === "ai") {
      pairs.push([
        { role: "user", text: messages[i].text },
        { role: "ai", text: messages[i + 1].text },
      ]);
    }
  }
  return pairs.slice(-HISTORY_PAIRS_SENT).flat();
}

function buildCasePrompt(c: VisitCase): string {
  return `다음 방문간호 사례를 검토하고 있어요. OMAHA 진단과 간호중재가 적절한지 피드백해주시고, 관련해서 궁금한 점에 답해주세요.

[사례] ${c.title} (${c.category})
- 대상자 정보: ${c.patientInfo}
- 주요 사정 소견: ${c.assessment}
- OMAHA 진단: ${c.omahaDiagnosis}
- 간호중재 계획: ${c.interventions}`;
}

const QUICK_MODES = [
  { label: "OMAHA 진단 피드백", value: "이 대상자의 OMAHA 간호진단 영역과 문제를 추천해줘: " },
  { label: "보건교육 지도", value: "다음 보건교육 주제로 15분 차시 보건교육 계획안 작성해줘: " },
  { label: "방문간호 사례", value: "방문간호 시 유의해야 할 가정환경 안전 사정 체크리스트 알려줘." },
];

export default function AiTutorChat({ initialCase = null }: { initialCase?: VisitCase | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickModes, setShowQuickModes] = useState(false);
  // The learning topic the student is asking under; questions are answered
  // from that topic's reference PDFs. None selected = a general question.
  const [category, setCategory] = useState<TutorCategoryKey | null>(null);
  // Starts empty (matching the server-rendered HTML) and is filled from
  // localStorage after mount, as in QuizPlayer.
  const [studentId, setStudentId] = useState("");
  useEffect(() => {
    setStudentId(loadSavedStudentId());
  }, []);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const sentInitialCase = useRef(false);
  const quickModesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (quickModesRef.current && !quickModesRef.current.contains(e.target as Node)) {
        setShowQuickModes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleStart() {
    const trimmed = studentId.trim();
    if (!trimmed || starting) return;
    saveStudentId(trimmed);
    setStudentId(trimmed);
    setStarting(true);

    // Earlier conversations saved under this student ID, from any device.
    let previous: Message[] = [];
    try {
      const response = await fetch(`/api/ai-tutor/history?studentId=${encodeURIComponent(trimmed)}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.history) && data.history.length > 0) {
        previous = [
          ...(data.history as SavedExchange[]).flatMap((h): Message[] => [
            { role: "user", text: h.message },
            { role: "ai", text: h.answer },
          ]),
          { role: "notice", text: "여기까지 이전에 나눈 대화입니다." },
        ];
      }
    } catch {
      // Starting without the earlier conversation beats not starting at all.
    }
    setMessages(previous);
    setStarting(false);
    setStarted(true);
  }

  function handleChangeStudent() {
    setStarted(false);
    setMessages([]);
    setCategory(null);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !started) return;

    const history = recentExchanges(messages);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          visitorId: getVisitorId(),
          studentId,
          category,
          history,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "답변을 가져오지 못했습니다.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer,
          sources: Array.isArray(data.sources) ? data.sources : undefined,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "error", text: error instanceof Error ? error.message : "오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialCase || !started || sentInitialCase.current) return;
    sentInitialCase.current = true;
    sendMessage(buildCasePrompt(initialCase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCase, started]);

  // Keep the newest message in view, including right after earlier history loads.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  function selectCategory(next: (typeof TUTOR_CATEGORIES)[number]) {
    if (loading || next.key === category) return;
    setCategory(next.key);
    setMessages((prev) => [
      ...prev,
      {
        role: "notice",
        text: `${next.icon} 「${next.label}」 주제를 선택했습니다. 교수님이 올려 주신 이 주제의 자료를 바탕으로 답변합니다.`,
      },
    ]);
  }

  function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage(input);
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase">
            Gemini Powered
          </span>
          <h3 className="text-lg font-bold">지역사회간호 보건교육 튜터 🤖</h3>
          <p className="text-xs text-slate-300">
            사전학습, 지역보건의료기관, 사례연구, OMAHA 중 학습 주제를 고르고 AI 간호 교수님에게
            물어보세요.
          </p>
        </div>
        <div ref={quickModesRef} className="relative shrink-0">
          <button
            onClick={() => setShowQuickModes((v) => !v)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <i className="fa-regular fa-circle-question" />
            질문할 내용을 모르겠어요
            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${showQuickModes ? "rotate-180" : ""}`} />
          </button>
          {showQuickModes && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-10">
              {QUICK_MODES.map((mode) => (
                <button
                  key={mode.label}
                  onClick={() => {
                    setInput(mode.value);
                    setShowQuickModes(false);
                  }}
                  className="block w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 transition-colors"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {initialCase && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
          <i className="fa-solid fa-notes-medical" />
          <span>
            <strong>{initialCase.category}</strong> 사례 &ldquo;{initialCase.title}&rdquo;를
            바탕으로 대화 중입니다.
          </span>
        </div>
      )}

      {!started && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-md mx-auto text-center">
          <h3 className="text-base font-bold text-slate-800">학번을 입력하고 튜터를 시작하세요</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            질문과 답변이 학번과 함께 저장되어, 다른 기기에서도 같은 학번으로 이전 대화를 다시 볼
            수 있습니다. 저장된 대화는 담당 교수님도 확인할 수 있습니다.
          </p>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="예: 20231234"
            maxLength={30}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-center outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleStart}
            disabled={!studentId.trim() || starting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {starting ? "이전 대화를 불러오는 중..." : "튜터 시작하기"}
          </button>
        </div>
      )}

      {started && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">학습 주제</span>
            {TUTOR_CATEGORIES.map((c) => {
              const isSelected = c.key === category;
              return (
                <button
                  key={c.key}
                  onClick={() => selectCategory(c)}
                  disabled={loading}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              );
            })}
            <span className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
              학번 {studentId}
              <button onClick={handleChangeStudent} disabled={loading} className="font-semibold text-emerald-600 hover:underline disabled:opacity-50">
                변경
              </button>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs md:text-sm">
              {messages.length === 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    AI
                  </div>
                  <div className="bg-slate-100 text-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[85%] space-y-2">
                    <p className="font-bold text-emerald-800 text-xs">
                      안녕하세요! 지역사회간호학 AI 실습 튜터입니다. 🌿
                    </p>
                    <p className="leading-relaxed">
                      위에서 학습 주제를 고르면 교수님이 올려 주신 자료를 바탕으로 답변합니다. 주제를
                      고른 뒤 궁금한 내용을 질문해 보세요!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m, idx) =>
                m.role === "notice" ? (
                  <p key={idx} className="text-center text-[11px] text-slate-400">
                    {m.text}
                  </p>
                ) : m.role === "user" ? (
                  <div key={idx} className="flex items-start justify-end space-x-3">
                    <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                        m.role === "error" ? "bg-rose-600" : "bg-emerald-600"
                      }`}
                    >
                      {m.role === "error" ? "!" : "AI"}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                        m.role === "error" ? "bg-rose-50 text-rose-800" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {m.text}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 whitespace-normal">
                          {m.sources.map((source, sourceIdx) => (
                            <a
                              key={sourceIdx}
                              href={`${source.fileUrl}#page=${source.page}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-50"
                            >
                              <i className="fa-solid fa-file-pdf" /> {source.title} {source.page}쪽 열기
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    AI
                  </div>
                  <div className="bg-slate-100 text-slate-500 p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center space-x-2">
                    <i className="fa-solid fa-spinner fa-spin text-emerald-600" />
                    <span>지역사회간호학 AI 교수님이 답안을 작성 중입니다...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50 rounded-b-2xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="질문을 입력하세요 (예: BPRN 우선순위 산출 시 고려할 점은?)"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <span>전송</span>
                <i className="fa-solid fa-paper-plane text-xs" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
