import type { QuizStatsSummary } from "@/lib/quiz";

export default function QuizStatsView({ stats }: { stats: QuizStatsSummary }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">퀴즈 응시 통계</h2>
        <p className="text-sm text-slate-500 mt-1">
          학생이 결과를 제출할 때마다 자동 집계됩니다. 방문자 브라우저의 익명 ID 기준이라 로그인은 필요 없어요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">총 응시 횟수</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {stats.totalSubmissions.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">평균 점수</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{stats.averageScore}점</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">문항별 오답률 (높은 순)</h3>
        {stats.questionStats.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            아직 제출된 퀴즈가 없습니다. 학생이 퀴즈를 풀고 제출하면 여기에 집계됩니다.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {stats.questionStats.map((q, idx) => (
              <div key={q.questionId} className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-700">
                    {idx + 1}. {q.questionText}
                  </span>
                  <span
                    className={`shrink-0 font-bold ${
                      q.wrongRate >= 50 ? "text-rose-600" : "text-slate-600"
                    }`}
                  >
                    오답률 {q.wrongRate}% ({q.wrongAnswers}/{q.totalAnswers})
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      q.wrongRate >= 50 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${q.wrongRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
