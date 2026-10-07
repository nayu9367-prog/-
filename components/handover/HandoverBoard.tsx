"use client";

import { useState, type FormEvent } from "react";
import { formatDate } from "@/lib/format";
import {
  HANDOVER_SECTIONS,
  MAX_HANDOVER_TEXT_LENGTH,
  type HandoverNote,
} from "@/lib/handoverData";

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500";

const ALL = "전체";

export default function HandoverBoard({
  initialNotes,
  institutions,
  admin = false,
}: {
  initialNotes: HandoverNote[];
  // Names to choose from; with none registered the student types the name.
  institutions: string[];
  // The admin view deletes notes instead of writing them.
  admin?: boolean;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(ALL);
  const [institution, setInstitution] = useState(institutions[0] ?? "");
  const [period, setPeriod] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sections, setSections] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const written = [...new Set(notes.map((n) => n.institution))];
  const shown = filter === ALL ? notes : notes.filter((n) => n.institution === filter);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institution, period, authorName, sections }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setNotes((prev) => [data.note, ...prev]);
      setSections({});
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 인계사항을 삭제하시겠습니까?")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/handover/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[ALL, ...written].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter(name)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                filter === name
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        {!admin && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow transition-all"
          >
            <i className="fa-solid fa-pen mr-1" /> {open ? "작성 취소" : "인계사항 작성"}
          </button>
        )}
      </div>

      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      {open && !admin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {institutions.length > 0 ? (
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className={inputClass}
              >
                {institutions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                placeholder="실습기관 (예: 서구보건소)"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className={inputClass}
              />
            )}
            <input
              required
              placeholder="실습 시기·조 (예: 2학기 1조)"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="작성자 (예: 3학년 민수)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={inputClass}
            />
          </div>
          {HANDOVER_SECTIONS.map((section) => (
            <label
              key={section.key}
              className="flex flex-col gap-1 text-sm font-medium text-slate-700"
            >
              {section.label}
              <textarea
                rows={3}
                maxLength={MAX_HANDOVER_TEXT_LENGTH}
                placeholder={section.placeholder}
                value={sections[section.key] ?? ""}
                onChange={(e) => setSections((prev) => ({ ...prev, [section.key]: e.target.value }))}
                className={`${inputClass} font-normal`}
              />
            </label>
          ))}
          <p className="text-[11px] text-slate-400">
            해당 없는 항목은 비워 두어도 됩니다. 한 항목 이상 작성해 주세요.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "등록 중..." : "인계사항 등록"}
          </button>
        </form>
      )}

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 등록된 인계사항이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((note) => (
            <li key={note.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    {note.institution}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{note.period}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {note.authorName} · {formatDate(note.createdAt)}
                </span>
              </div>
              <dl className="space-y-2">
                {note.sections.map((section) => (
                  <div key={section.label}>
                    <dt className="text-xs font-bold text-emerald-700">{section.label}</dt>
                    <dd className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                      {section.text}
                    </dd>
                  </div>
                ))}
              </dl>
              {admin && (
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={busy}
                  className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
