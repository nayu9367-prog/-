"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nursihub_checklist";

export default function ChecklistWidget({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => Array(items.length).fill(false));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          setChecked(parsed);
        }
      }
    } catch {
      // localStorage 접근 불가 시 기본값 사용
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

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
          {doneCount}/{items.length} 항목 완료
        </span>
      </div>
      <div className="space-y-2.5 text-xs">
        {items.map((item, idx) => (
          <label
            key={idx}
            className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checked[idx] ?? false}
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
