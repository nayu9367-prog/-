import type { AnalyticsSummary } from "@/lib/analytics";

const PATH_LABELS: Record<string, string> = {
  "/": "대시보드",
  "/ai-tutor": "AI 사례·보건교육 튜터",
  "/quiz": "지역사회 실습 퀴즈",
  "/skills": "핵심술기 동영상",
  "/tools": "BPRN 계산기·사정도구",
  "/resources": "OMAHA·실습 서식",
  "/community": "실습 후기·Q&A",
};

function pathLabel(path: string): string {
  return PATH_LABELS[path] ?? path;
}

export default function StatsView({ summary }: { summary: AnalyticsSummary }) {
  const maxDaily = Math.max(1, ...summary.dailyViews.map((d) => d.count));
  const maxPath = Math.max(1, ...summary.topPaths.map((p) => p.count));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">학생 이용 통계</h2>
        <p className="text-sm text-slate-500 mt-1">
          방문자 브라우저에 저장된 익명 ID를 기준으로 집계됩니다 (로그인 불필요).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">전체 조회수</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {summary.totalViews.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">순 방문자 수</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {summary.uniqueVisitors.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">최근 7일 조회수</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">
            {summary.viewsLast7Days.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">최근 14일 조회 추이</h3>
        {summary.dailyViews.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">아직 기록된 조회가 없습니다.</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {summary.dailyViews.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-emerald-500 rounded-t-md min-h-[2px]"
                    style={{ height: `${(d.count / maxDaily) * 100}%` }}
                    title={`${d.day}: ${d.count}회`}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">페이지별 조회수 Top 10</h3>
        {summary.topPaths.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">아직 기록된 조회가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {summary.topPaths.map((p) => (
              <div key={p.path} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs font-medium text-slate-700 truncate">
                  {pathLabel(p.path)}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(p.count / maxPath) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-xs font-bold text-slate-600 text-right">
                  {p.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
