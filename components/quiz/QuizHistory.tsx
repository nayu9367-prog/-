"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSavedStudentId } from "@/lib/studentId";

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
  // `ready` stays false through the server render and the client's first
  // paint (so both match and hydration doesn't break), then flips true
  // once we've read localStorage — only after that do we know whether to
  // show the empty state or fetch history, so no branch is decided until
  // then.
  const [ready, setReady] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [submissions, setSubmissions] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = loadSavedStudentId();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from client-only localStorage after hydration
    setStudentId(saved);
    setReady(true);
    if (!saved) return;

    let cancelled = false;
    setLoading(true);
    fetch(`/api/quiz/history?studentId=${encodeURIComponent(saved)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "조회에 실패했습니다.");
        if (!cancelled) setSubmissions(data.submissions ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "조회에 실패했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return null;
  }

  if (!studentId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 max-w-2xl mx-auto text-center">
        <h3 className="text-base font-bold text-slate-800">아직 이 기기에서 응시한 기록이 없어요</h3>
        <p className="text-sm text-slate-500">퀴즈를 한 번 풀고 제출하면, 이 화면에서 내 점수 기록을 볼 수 있어요.</p>
        <Link
          href="/quiz"
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md"
        >
          퀴즈 풀러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
      <div>
        <h3 className="text-base font-bold text-slate-800">내 퀴즈 기록</h3>
        <p className="text-xs text-slate-500 mt-1">학번 {studentId}로 제출한 기록입니다.</p>
      </div>

      {loading && <p className="text-sm text-slate-400 text-center py-8">불러오는 중...</p>}
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
