"use client";

import { useState } from "react";
import StudentGate from "@/components/StudentGate";

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
  // Null until the student has confirmed their ID and PIN.
  const [studentId, setStudentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReady(confirmedId: string) {
    setStudentId(confirmedId);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/quiz/history");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "조회에 실패했습니다.");
      setSubmissions(data.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!studentId) {
    return (
      <StudentGate
        title="학번을 확인하고 내 기록을 보세요"
        description="퀴즈를 제출할 때 사용한 학번과 PIN을 입력하면, 그 학번으로 제출한 점수 기록을 볼 수 있습니다."
        startLabel="내 기록 보기"
        onReady={handleReady}
      />
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
