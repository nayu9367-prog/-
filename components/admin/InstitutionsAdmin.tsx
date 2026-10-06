"use client";

import { useState } from "react";
import type { Institution, InstitutionsSettings } from "@/lib/institutionsSettings";

function emptyItem(): Institution {
  return { name: "", address: "", phone: "", note: "" };
}

export default function InstitutionsAdmin({ initialSettings }: { initialSettings: InstitutionsSettings }) {
  const [items, setItems] = useState<Institution[]>(
    initialSettings.items.length > 0 ? initialSettings.items : [emptyItem()]
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(idx: number, patch: Partial<Institution>) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function remove(idx: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyItem()]));
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/institutions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setItems(data.settings.items.length > 0 ? data.settings.items : [emptyItem()]);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">실습기관 정보 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 실습기관 정보 페이지에 바로 반영됩니다.
          </p>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">기관 {idx + 1}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              >
                삭제
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={item.name}
                onChange={(e) => update(idx, { name: e.target.value })}
                placeholder="기관 이름 (예: ○○구 보건소)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              <input
                value={item.phone}
                onChange={(e) => update(idx, { phone: e.target.value })}
                placeholder="연락처"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
            <input
              value={item.address}
              onChange={(e) => update(idx, { address: e.target.value })}
              placeholder="주소"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <textarea
              value={item.note}
              onChange={(e) => update(idx, { note: e.target.value })}
              rows={3}
              placeholder="안내 (예: 실습 시간, 담당자, 오시는 길, 준비물)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          + 기관 추가
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "실습기관 정보 저장"}
        </button>
      </div>
    </div>
  );
}
