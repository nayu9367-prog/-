"use client";

import { useState } from "react";
import type { DashboardSettings, QuickAction, QuickActionColor } from "@/lib/dashboardSettings";

const COLOR_OPTIONS: QuickActionColor[] = ["emerald", "amber", "sky"];

function emptyQuickAction(): QuickAction {
  return { icon: "fa-solid fa-star", color: "emerald", title: "", desc: "", href: "", cta: "" };
}

function TextListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: (idx: number) => string;
}) {
  function update(idx: number, value: string) {
    onChange(items.map((s, i) => (i === idx ? value : s)));
  }
  function remove(idx: number) {
    onChange(items.length > 1 ? items.filter((_, i) => i !== idx) : [""]);
  }
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
            {idx + 1}
          </span>
          <input
            value={item}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={placeholder?.(idx)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="shrink-0 rounded-md border border-rose-200 px-2 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
          >
            삭제
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        + 항목 추가
      </button>
    </div>
  );
}

function QuickActionsEditor({
  actions,
  onChange,
}: {
  actions: QuickAction[];
  onChange: (actions: QuickAction[]) => void;
}) {
  function update(idx: number, patch: Partial<QuickAction>) {
    onChange(actions.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }
  function remove(idx: number) {
    onChange(actions.length > 1 ? actions.filter((_, i) => i !== idx) : [emptyQuickAction()]);
  }
  function add() {
    onChange([...actions, emptyQuickAction()]);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">바로가기 카드</label>
      {actions.map((action, idx) => (
        <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">카드 {idx + 1}</span>
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
              value={action.title}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="카드 제목"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <input
              value={action.href}
              onChange={(e) => update(idx, { href: e.target.value })}
              placeholder="연결 경로 (예: /quiz)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
          <textarea
            value={action.desc}
            onChange={(e) => update(idx, { desc: e.target.value })}
            rows={2}
            placeholder="카드 설명"
            className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={action.icon}
              onChange={(e) => update(idx, { icon: e.target.value })}
              placeholder="아이콘 (예: fa-solid fa-star)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <select
              value={action.color}
              onChange={(e) => update(idx, { color: e.target.value as QuickActionColor })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={action.cta}
              onChange={(e) => update(idx, { cta: e.target.value })}
              placeholder="버튼 문구 (예: 퀴즈 풀러 가기)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        + 카드 추가
      </button>
    </div>
  );
}

export default function DashboardAdmin({ initialSettings }: { initialSettings: DashboardSettings }) {
  const [form, setForm] = useState<DashboardSettings>(initialSettings);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setForm(data.settings);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">대시보드 화면 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 대시보드에 바로 반영됩니다.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          환영 문구 제목
          <input
            value={form.heroTitle}
            onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          환영 문구 부제목
          <input
            value={form.heroSubtitle}
            onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>

        <QuickActionsEditor
          actions={form.quickActions}
          onChange={(quickActions) => setForm((f) => ({ ...f, quickActions }))}
        />

        <TextListEditor
          label="지역사회 필수 실습 체크리스트"
          items={form.checklist}
          onChange={(checklist) => setForm((f) => ({ ...f, checklist }))}
          placeholder={(idx) => `체크리스트 항목 ${idx + 1}`}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "대시보드 저장"}
        </button>
      </div>
    </div>
  );
}
