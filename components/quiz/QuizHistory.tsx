"use client";

import { useState } from "react";
import { loadSavedStudentId, saveStudentId } from "@/lib/studentId";

type HistoryEntry = {
  id: string;
  studentId: string;
  correctCount: number;
  totalCount: number;
  score: number;
  createdAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export default function QuizHistory() {
  const [studentId, setStudentId] = useState(loadSavedStudentId);
  const [submissions, setSubmissions] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(id: string) {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/quiz/history?studentId=${encodeURIComponent(trimmed)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "조회에 실패했습니다.");
      saveStudentId(trimmed);
      setSubmissions(data.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "조회에 실패했습니다.");
      setSubmissions(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
      <div>
        <h3 className="text-base font-bold text-slate-800">내 퀴즈 기록 조회</h3>
        <p className="text-xs text-slate-500 mt-1">학번을 입력하면 이전에 제출한 퀴즈 점수를 확인할 수 있어요.</p>
      </div>
      <div className="flex gap-2">
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search(studentId)}
          placeholder="예: 20231234"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => search(studentId)}
          disabled={loading || !studentId.trim()}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          조회하기
        </button>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      {submissions !== null && (
        submissions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            아직 제출한 퀴즈 기록이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {submissions.map((s, idx) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-sm"
              >
                <div>
                  <span className="font-bold text-slate-700">
                    {submissions.length - idx}회차
                  </span>
                  <span className="text-slate-400 text-xs ml-2">{formatDate(s.createdAt)}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700">{s.score}점</span>
                  <span className="text-slate-400 text-xs ml-2">
                    {s.correctCount}/{s.totalCount} 정답
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
