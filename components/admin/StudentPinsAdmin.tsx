"use client";

import { useState } from "react";
import type { StudentPinRecord } from "@/lib/studentPins";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Seoul" });
}

export default function StudentPinsAdmin({ initialRecords }: { initialRecords: StudentPinRecord[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReset(studentId: string) {
    if (
      !window.confirm(
        `학번 ${studentId}의 PIN을 초기화하시겠습니까?\n학생이 다음에 들어올 때 새 PIN을 정하게 됩니다. 퀴즈·튜터 기록은 그대로 남습니다.`
      )
    ) {
      return;
    }
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/settings/student-pins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "초기화에 실패했습니다.");
      setRecords((prev) => prev.filter((r) => r.studentId !== studentId));
      setNotice(`학번 ${studentId}의 PIN을 초기화했습니다. 학생에게 다시 들어와 새 PIN을 정하라고 알려주세요.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "초기화에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const filtered = records.filter((r) => r.studentId.includes(query.trim()));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">학생 PIN 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          학생은 퀴즈와 AI 튜터를 처음 쓸 때 학번에 숫자 4자리 PIN을 정합니다. 학생이 PIN을 잊었거나
          다른 사람이 그 학번을 먼저 써 버렸다면 여기서 초기화하세요. PIN 자체는 암호화되어 저장되므로
          교수님도 볼 수 없습니다.
        </p>

        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {notice && <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</p>}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="학번으로 찾기"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 sm:max-w-xs"
        />

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {records.length === 0 ? "아직 PIN을 등록한 학생이 없습니다." : "해당하는 학번이 없습니다."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((r) => (
              <li
                key={r.studentId}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
              >
                <div>
                  <span className="font-bold text-slate-800">{r.studentId}</span>
                  <span className="ml-2 text-xs text-slate-400">등록 {formatDate(r.createdAt)}</span>
                </div>
                <button
                  onClick={() => handleReset(r.studentId)}
                  disabled={busy}
                  className="shrink-0 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  PIN 초기화
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
