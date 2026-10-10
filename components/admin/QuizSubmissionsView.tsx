"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QuizSubmissionRecord } from "@/lib/quiz";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Seoul" });
}

export default function QuizSubmissionsView({
  submissions,
}: {
  submissions: QuizSubmissionRecord[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // One submission, or all of them when none is named. The statistics above
  // are worked out on the server, so the page is loaded again afterwards.
  async function handleDelete(submission?: QuizSubmissionRecord) {
    const question = submission
      ? `학번 ${submission.studentId || "미입력"}의 ${formatDate(submission.createdAt)} 응시 기록을 삭제하시겠습니까? 되돌릴 수 없습니다.`
      : `응시 기록 ${submissions.length}건과 통계를 모두 삭제하시겠습니까? 되돌릴 수 없습니다.`;
    if (!window.confirm(question)) return;
    setError("");
    setBusy(true);
    try {
      const query = submission ? `?${new URLSearchParams({ id: submission.id })}` : "";
      const response = await fetch(`/api/quiz/submissions${query}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-sm">학번별 응시 기록 ({submissions.length}건)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            학번이 포함되어 있으니 취급에 유의하세요. 점수는 객관식 기준이며, 서술형 답안은 엑셀의
            &lsquo;서술형 답안&rsquo; 시트에서 볼 수 있습니다. 기록을 지우면 위의 통계와 엑셀에서도
            빠집니다.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {submissions.length > 0 && (
            <button
              type="button"
              onClick={() => handleDelete()}
              disabled={busy}
              className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
            >
              전체 삭제
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
          <a
            href="/api/quiz/submissions/export"
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-file-excel" /> 응시기록·오답률 엑셀 다운로드
          </a>
        </div>
      </div>

      {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

      {submissions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400 text-center py-8">
          아직 제출된 퀴즈가 없습니다.
        </p>
      ) : (
        <div className="mt-4 max-h-[420px] overflow-auto custom-scrollbar">
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 font-semibold">학번</th>
                <th className="py-2 font-semibold">점수</th>
                <th className="py-2 font-semibold">정답</th>
                <th className="py-2 font-semibold">제출일시</th>
                <th className="py-2 font-semibold text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-slate-700">{s.studentId || "미입력"}</td>
                  <td className="py-2 text-slate-600">
                    {s.totalCount > 0 ? `${s.score}점` : "서술형"}
                  </td>
                  <td className="py-2 text-slate-600">
                    {s.totalCount > 0 ? `${s.correctCount}/${s.totalCount}` : "-"}
                  </td>
                  <td className="py-2 text-slate-400">{formatDate(s.createdAt)}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      disabled={busy}
                      className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
