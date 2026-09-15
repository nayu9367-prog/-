"use client";

import { useMemo, useState } from "react";
import type { VisitCase } from "@/lib/casesData";

export default function CaseLibrary({ cases }: { cases: VisitCase[] }) {
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const c of cases) {
      if (!seen.has(c.category)) {
        seen.add(c.category);
        list.push(c.category);
      }
    }
    return list;
  }, [cases]);

  const [filter, setFilter] = useState<string>("all");
  const [activeCase, setActiveCase] = useState<VisitCase | null>(null);

  const filtered = filter === "all" ? cases : cases.filter((c) => c.category === filter);

  if (cases.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-notes-medical text-emerald-600" /> 방문간호 사례 라이브러리
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          질환별 방문간호 사례를 클릭해 대상자 정보, 사정, OMAHA 진단, 간호중재를 확인하세요.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            filter === "all"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          전체보기
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === cat
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCase(c)}
            className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-400 transition-all p-4 space-y-2"
          >
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              {c.category}
            </span>
            <h4 className="font-bold text-slate-800 text-sm leading-snug">{c.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2">{c.summary}</p>
            <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1 pt-1">
              사례 자세히 보기 <i className="fa-solid fa-arrow-right" />
            </span>
          </button>
        ))}
      </div>

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
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  {activeCase.category}
                </span>
                <h3 className="text-lg font-bold text-slate-800">{activeCase.title}</h3>
              </div>
              <button
                onClick={() => setActiveCase(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-user text-emerald-600" /> 대상자 정보
                </h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {activeCase.patientInfo}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-clipboard-list text-emerald-600" /> 주요 사정 소견
                </h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {activeCase.assessment}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-stethoscope text-emerald-600" /> OMAHA 진단
                </h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {activeCase.omahaDiagnosis}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-hand-holding-medical text-emerald-600" /> 간호중재 계획
                </h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {activeCase.interventions}
                </p>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveCase(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
