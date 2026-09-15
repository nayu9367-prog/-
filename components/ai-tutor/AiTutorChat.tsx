"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { VisitCase } from "@/lib/casesData";

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

const QUICK_QUERIES = [
  { label: "💡 OMAHA 진단 추천", value: "방문간호 대상자의 고혈압 복약 불이행 OMAHA 진단명을 추천해줘." },
  {
    label: "📑 보건교육 계획안 작성",
    value: "60대 재가 노인 대상 고혈압 15분 보건교육 계획안(도입-전개-정리) 템플릿을 만들어줘.",
  },
];

export default function AiTutorChat({ initialCase = null }: { initialCase?: VisitCase | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sentInitialCase = useRef(false);

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
        body: JSON.stringify({ message: trimmed }),
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
            OMAHA 진단 분류, 방문간호 사례관리 피드백, 15분 보건교육 계획안 작성을 AI 간호
            교수님에게 물어보세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {QUICK_MODES.map((mode) => (
            <button
              key={mode.label}
              onClick={() => setInput(mode.value)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all"
            >
              {mode.label}
            </button>
          ))}
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
                  보건소, 방문건강관리, 보건교육 계획안 작성 중 어려우신 부분이 있나요? 아래
                  버튼이나 질문을 입력해 보세요!
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_QUERIES.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => sendMessage(q.value)}
                      className="bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
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
