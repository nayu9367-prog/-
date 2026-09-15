"use client";

import { useEffect, useState } from "react";

const CHECKLIST_ITEMS = [
  "방문간호 가방 오염 방지용 신문지/매트 챙기기",
  "K-ADL / K-IADL 노인 기능 사정 도구 숙지",
  "BPRN 우선순위 산출 공식 (A+2B)×C 복습",
  "15분 만성질환 보건교육 리플렛 및 교구 준비",
  "OMAHA 진단 문제 목록 4대 영역에 맞게 작성",
];

const STORAGE_KEY = "nursihub_checklist";

export default function ChecklistWidget() {
  const [checked, setChecked] = useState<boolean[]>(() =>
    Array(CHECKLIST_ITEMS.length).fill(false)
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === CHECKLIST_ITEMS.length) {
          setChecked(parsed);
        }
      }
    } catch {
      // localStorage 접근 불가 시 기본값 사용
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // 저장 실패는 무시 (per-브라우저 편의 기능)
    }
  }, [checked, loaded]);

  const doneCount = checked.filter(Boolean).length;

  function toggle(idx: number) {
    setChecked((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <i className="fa-solid fa-list-check text-emerald-600" /> 지역사회 필수 실습 체크리스트
        </h3>
        <span className="text-[11px] text-emerald-600 font-bold">
          {doneCount}/{CHECKLIST_ITEMS.length} 항목 완료
        </span>
      </div>
      <div className="space-y-2.5 text-xs">
        {CHECKLIST_ITEMS.map((item, idx) => (
          <label
            key={item}
            className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checked[idx]}
              onChange={() => toggle(idx)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className={checked[idx] ? "line-through text-slate-400" : "text-slate-700 font-medium"}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
