import type { QuizSubmissionRecord } from "@/lib/quiz";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export default function QuizSubmissionsView({
  submissions,
}: {
  submissions: QuizSubmissionRecord[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">학번별 응시 기록 ({submissions.length}건)</h3>
          <p className="text-xs text-slate-400 mt-0.5">학번이 포함되어 있으니 취급에 유의하세요.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
        <a
          href="/api/quiz/submissions/export"
          className="shrink-0 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 transition-all flex items-center gap-1.5"
        >
          <i className="fa-solid fa-file-csv" /> 응시기록·오답률 엑셀 다운로드
        </a>
      </div>

      {submissions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400 text-center py-8">
          아직 제출된 퀴즈가 없습니다.
        </p>
      ) : (
        <div className="mt-4 max-h-[420px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 font-semibold">학번</th>
                <th className="py-2 font-semibold">점수</th>
                <th className="py-2 font-semibold">정답</th>
                <th className="py-2 font-semibold">제출일시</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-slate-700">{s.studentId || "미입력"}</td>
                  <td className="py-2 text-slate-600">{s.score}점</td>
                  <td className="py-2 text-slate-600">
                    {s.correctCount}/{s.totalCount}
                  </td>
                  <td className="py-2 text-slate-400">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
