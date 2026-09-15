"use client";

import { useState } from "react";
import type { ProfessorQuestion } from "@/lib/professorQuestions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export default function ProfessorQuestionsView({
  initialQuestions,
  totalCount,
}: {
  initialQuestions: ProfessorQuestion[];
  totalCount: number;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/professor-questions/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClearAll() {
    if (!window.confirm("모든 질문 기록을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/professor-questions", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">담당 교수님께 질문하기 기록</h2>
        <p className="text-sm text-slate-500 mt-1">
          학생이 이름·학번과 함께 남긴 질문입니다. 구글 시트로도 동일하게 전달되며, 여기서는
          백업용으로 확인할 수 있습니다. 실명·학번이 포함되어 있으니 취급에 유의하세요.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-800 text-sm">
            전체 {totalCount.toLocaleString()}건 중 최근 {questions.length}건
          </h3>
          {questions.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={busy}
              className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
            >
              전체 삭제
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
        )}

        {questions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400 text-center py-8">
            아직 등록된 질문이 없습니다.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3 max-h-[480px] overflow-y-auto custom-scrollbar">
            {questions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-slate-700">
                    {q.name} ({q.studentId})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{formatDate(q.createdAt)}</span>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={busy}
                      className="text-rose-500 hover:underline disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{q.question}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
