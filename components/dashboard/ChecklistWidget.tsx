"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nursihub_checklist";

// A line starting with "#" is a group title, not something to tick off.
function groupTitle(item: string): string | null {
  return item.startsWith("#") ? item.replace(/^#+\s*/, "") : null;
}

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

  // Items keep their position in the full list, which is what the saved
  // ticks are keyed by.
  const groups: { title: string | null; rows: { text: string; idx: number }[] }[] = [];
  items.forEach((item, idx) => {
    const title = groupTitle(item);
    if (title !== null) {
      groups.push({ title, rows: [] });
      return;
    }
    if (groups.length === 0) groups.push({ title: null, rows: [] });
    groups[groups.length - 1].rows.push({ text: item, idx });
  });
  const rows = groups.flatMap((group) => group.rows);
  const doneCount = rows.filter((row) => checked[row.idx]).length;

  function toggle(idx: number) {
    setChecked((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-2">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <i className="fa-solid fa-list-check text-emerald-600" /> 지역사회간호학실습 전 체크리스트(필수)
        </h3>
        <span className="shrink-0 text-xs text-emerald-600 font-bold">
          {doneCount}/{rows.length} 항목 완료
        </span>
      </div>
      <div className={`grid grid-cols-1 gap-x-6 gap-y-4 text-sm ${groups.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-2.5">
            {group.title !== null && <p className="text-sm font-bold text-emerald-800">{group.title}</p>}
            {group.rows.map((row) => (
              <label
                key={row.idx}
                className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked[row.idx] ?? false}
                  onChange={() => toggle(row.idx)}
                  className="w-4 h-4 shrink-0 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className={checked[row.idx] ? "line-through text-slate-400" : "text-slate-700 font-medium"}>
                  {row.text}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
