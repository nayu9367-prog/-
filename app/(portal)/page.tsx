import Link from "next/link";
import { getAnnouncements } from "@/lib/data";
import { formatDate } from "@/lib/format";
import ChecklistWidget from "@/components/dashboard/ChecklistWidget";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    href: "/ai-tutor",
    icon: "fa-solid fa-robot",
    color: "emerald",
    title: "AI 사례 & 보건교육 튜터",
    desc: "OMAHA 진단 분류, 방문간호 상담 연습, 보건교육 계획안 작성 피드백을 받아보세요.",
    cta: "대화 시작하기",
  },
  {
    href: "/quiz",
    icon: "fa-solid fa-gamepad",
    color: "amber",
    title: "지역사회 실습 퀴즈",
    desc: "BPRN 우선순위, OMAHA 진단, 방문간호 감염 관리 핵심 퀴즈를 풀어보세요.",
    cta: "퀴즈 풀러 가기",
  },
  {
    href: "/skills",
    icon: "fa-solid fa-circle-play",
    color: "sky",
    title: "핵심술기 동영상 관",
    desc: "방문간호 Nurse Bag 세팅, 노인 기능 사정 등 핵심 수행지침 영상을 시청하세요.",
    cta: "영상 시청하기",
  },
] as const;

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", hover: "hover:border-emerald-500 group-hover:text-emerald-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", hover: "hover:border-amber-500 group-hover:text-amber-700" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", hover: "hover:border-sky-500 group-hover:text-sky-700" },
};

export default async function DashboardPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg shadow-emerald-600/10">
        <span className="text-xs font-semibold text-emerald-100 uppercase">지역사회간호학 실습 포털</span>
        <h3 className="text-2xl font-bold mt-1">환영합니다, NursiHub와 함께 실습을 준비해요 🌿</h3>
        <p className="text-sm text-emerald-100 mt-1">
          공지사항 확인부터 퀴즈, BPRN 계산, 실습 자료까지 한 곳에서 관리하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {quickActions.map((action) => {
          const c = colorClasses[action.color];
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`bg-white p-6 rounded-2xl border border-slate-200 ${c.hover} hover:shadow-md transition-all group space-y-3 block`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}
              >
                <i className={action.icon} />
              </div>
              <h4 className="font-bold text-slate-900">{action.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
              <span className={`text-xs font-bold flex items-center gap-1 pt-1 ${c.text}`}>
                {action.cta} <i className="fa-solid fa-arrow-right" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-bullhorn text-emerald-600" /> 임상실습 공지사항
            </h3>
            <Link href="/community" className="text-[11px] text-emerald-600 font-bold hover:underline">
              질문 남기기 &rarr;
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              등록된 공지사항이 없습니다.
            </p>
          ) : (
            <ul className="space-y-3 text-xs text-slate-600 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {announcements.map((a) => (
                <li key={a.id} className="p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-800">{a.title}</span>
                    <time dateTime={a.createdAt} className="text-slate-400 text-[11px] shrink-0">
                      {formatDate(a.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-slate-500">{a.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ChecklistWidget />
      </div>
    </div>
  );
}
