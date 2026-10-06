"use client";

import { useState } from "react";
import type { FaqItem, FaqSettings } from "@/lib/faqSettings";

function emptyItem(): FaqItem {
  return { question: "", answer: "" };
}

export default function FaqAdmin({ initialSettings }: { initialSettings: FaqSettings }) {
  const [items, setItems] = useState<FaqItem[]>(
    initialSettings.items.length > 0 ? initialSettings.items : [emptyItem()]
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(idx: number, patch: Partial<FaqItem>) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function remove(idx: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyItem()]));
  }
  function move(idx: number, by: number) {
    setItems((prev) => {
      const to = idx + by;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/faq", {
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
      <h2 className="text-lg font-semibold text-slate-800">자주 묻는 질문(FAQ) 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 자주 묻는 질문 페이지에 바로 반영됩니다.
          </p>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">질문 {idx + 1}</span>
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  위로
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  아래로
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  삭제
                </button>
              </span>
            </div>
            <input
              value={item.question}
              onChange={(e) => update(idx, { question: e.target.value })}
              placeholder="질문"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <textarea
              value={item.answer}
              onChange={(e) => update(idx, { answer: e.target.value })}
              rows={3}
              placeholder="답변"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          + 질문 추가
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "자주 묻는 질문 저장"}
        </button>
      </div>
    </div>
  );
}
