"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { VisitCase } from "@/lib/casesData";
import { getVisitorId } from "@/lib/visitorId";
import { TUTOR_CATEGORIES, type TutorCategoryKey } from "@/lib/tutorCategories";

type Message = { role: "user" | "ai" | "error"; text: string };

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

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, visitorId: getVisitorId(), category }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "답변을 가져오지 못했습니다.");
      }

      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
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
    if (!initialCase || sentInitialCase.current) return;
    sentInitialCase.current = true;
    sendMessage(buildCasePrompt(initialCase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCase]);

  function selectCategory(next: (typeof TUTOR_CATEGORIES)[number]) {
    if (loading || next.key === category) return;
    setCategory(next.key);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `${next.icon} 「${next.label}」 주제를 선택했습니다. 교수님이 올려 주신 이 주제의 자료를 바탕으로 답변할게요. 궁금한 내용을 질문해 주세요!`,
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
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs md:text-sm">
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
            m.role === "user" ? (
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
    </div>
  );
}
