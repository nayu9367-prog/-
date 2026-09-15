"use client";

import { useState } from "react";

export default function BprnCalculator() {
  const [a, setA] = useState(8);
  const [b, setB] = useState(7);
  const [c, setC] = useState(1.2);

  const score = (a + 2 * b) * c;
  const evalText =
    score >= 25
      ? { label: "최우선 순위 간호사업 대상 (매우 높음)", className: "text-emerald-600" }
      : score >= 15
      ? { label: "중간 순위 간호사업 대상 (보통)", className: "text-amber-600" }
      : { label: "후순위 간호사업 대상 (낮음)", className: "text-slate-500" };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-calculator text-emerald-600" /> BPRN (Basic Priority Rating
          System) 간호진단 우선순위 계산기
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          공식: BPRN = (A + 2B) × C (A: 문제의 크기 0~10점, B: 문제의 심각도 0~10점, C: 사업의
          추정 효과 0.5~1.5점)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700">A. 문제의 크기 (Size of Problem: 0 ~ 10)</label>
          <input
            type="number"
            min={0}
            max={10}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-slate-400">유병률 및 인구수 비율 기준</p>
        </div>
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700">B. 문제의 심각도 (Urgency/Severity: 0 ~ 10)</label>
          <input
            type="number"
            min={0}
            max={10}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-slate-400">긴급성, 사망률, 경제적 손실 등</p>
        </div>
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700">C. 사업의 추정 효과 (Effectiveness: 0.5 ~ 1.5)</label>
          <input
            type="number"
            step={0.1}
            min={0.5}
            max={1.5}
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-slate-400">사업 해결 가능성 및 효과성</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-700 font-bold uppercase">BPRN 우선순위 산출 점수</span>
          <div className="text-3xl font-black text-emerald-800">{score.toFixed(1)} 점</div>
          <div className={`text-xs font-bold mt-1 ${evalText.className}`}>{evalText.label}</div>
        </div>
      </div>
    </div>
  );
}
