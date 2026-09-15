"use client";

import { useState } from "react";
import type { AiTutorLog } from "@/lib/aiTutorLogs";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export default function AiTutorLogsView({
  initialLogs,
  totalCount,
}: {
  initialLogs: AiTutorLog[];
  totalCount: number;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/ai-tutor-logs/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClearAll() {
    if (!window.confirm("모든 AI 튜터 질문 기록을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/ai-tutor-logs", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setLogs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-800 text-sm">
          AI 튜터 질문 기록 (전체 {totalCount.toLocaleString()}건 중 최근 {logs.length}건)
        </h3>
        {logs.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={busy}
            className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
          >
            전체 삭제
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-4">
        학생이 익명으로 남긴 질문과 AI 답변입니다. 실습 대상자 개인정보가 포함될 수 있으니 취급에
        유의하세요.
      </p>
      {error && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
      )}
      {logs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">아직 기록된 질문이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3 max-h-[480px] overflow-y-auto custom-scrollbar">
          {logs.map((log) => (
            <li key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-slate-400">{formatDate(log.createdAt)}</span>
                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={busy}
                  className="text-rose-500 hover:underline disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
              <p className="font-semibold text-slate-800 whitespace-pre-wrap">Q. {log.message}</p>
              <p className="mt-1.5 text-slate-600 whitespace-pre-wrap line-clamp-4">
                A. {log.answer}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
