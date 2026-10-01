"use client";

import { useState, type FormEvent } from "react";
import {
  MAX_QUIZ_QUESTION_COUNT,
  MIN_QUIZ_QUESTION_COUNT,
  type QuizSettings,
} from "@/lib/quizSettings";

export default function QuizCountSetting({
  initialSettings,
  bankSize,
}: {
  initialSettings: QuizSettings;
  bankSize: number;
}) {
  const [saved, setSaved] = useState(initialSettings.questionCount);
  const [value, setValue] = useState(String(initialSettings.questionCount));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionCount: Number(value) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setSaved(data.settings.questionCount);
      setValue(String(data.settings.questionCount));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">랜덤 출제 설정</h2>
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          학생이 퀴즈를 풀 때마다 문제 은행({bankSize}문제)에서{" "}
          <b className="text-emerald-700">{Math.min(saved, bankSize)}문제</b>를 무작위로 골라 출제합니다.
        </p>
        {bankSize < saved && (
          <p className="text-xs text-amber-700">
            문제 은행의 문제가 {saved}문제보다 적어서, 지금은 등록된 {bankSize}문제가 모두 출제됩니다.
          </p>
        )}
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 다음 퀴즈부터 바로 반영됩니다.
          </p>
        )}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            한 번에 출제할 문제 수
            <input
              type="number"
              required
              min={MIN_QUIZ_QUESTION_COUNT}
              max={MAX_QUIZ_QUESTION_COUNT}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            저장
          </button>
          <span className="text-xs text-slate-400">
            ({MIN_QUIZ_QUESTION_COUNT}~{MAX_QUIZ_QUESTION_COUNT}문제)
          </span>
        </div>
      </form>
    </section>
  );
}
