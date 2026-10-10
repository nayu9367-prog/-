"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VisitCase } from "@/lib/casesData";

export default function CaseLibrary({ cases }: { cases: VisitCase[] }) {
  const router = useRouter();
  const [activeCase, setActiveCase] = useState<VisitCase | null>(null);

  function consultAi(c: VisitCase) {
    router.push(`/ai-tutor?case=${c.id}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-notes-medical text-emerald-600" /> 방문간호 사례 시나리오
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          대상자를 클릭해 시나리오를 읽고, 직접 사정과 OMAHA 진단을 생각해 본 뒤 AI 튜터와
          이야기해보세요.
        </p>
      </div>

      {cases.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 등록된 시나리오가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(c)}
              className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-400 transition-all p-4 space-y-2"
            >
              <h4 className="font-bold text-slate-800 text-sm leading-snug flex items-center gap-1.5">
                <i className="fa-solid fa-user text-emerald-600" /> {c.name}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-3">{c.scenario}</p>
              <span className="text-sm text-emerald-700 font-bold inline-flex items-center gap-1 pt-1">
                시나리오 읽기 <i className="fa-solid fa-arrow-right" />
              </span>
            </button>
          ))}
        </div>
      )}

      {activeCase && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveCase(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-user text-emerald-600" /> {activeCase.name}
              </h3>
              <button
                onClick={() => setActiveCase(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            {/* One paragraph per line of the scenario, so a long narrative
                reads as short blocks instead of a wall of text. */}
            <div className="space-y-4 text-[15px] leading-7 text-slate-700 bg-slate-50 p-5 rounded-xl border border-slate-200">
              {activeCase.scenario
                .split(/\n+/)
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, i) => (
                  <p key={i}>{paragraph.trim()}</p>
                ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveCase(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
              >
                닫기
              </button>
              <button
                onClick={() => consultAi(activeCase)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-robot" /> AI 튜터와 이 시나리오로 대화하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
