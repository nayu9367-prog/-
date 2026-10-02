import Link from "next/link";
import { getAnnouncements } from "@/lib/data";
import { getDashboardSettings } from "@/lib/dashboardSettings";
import ChecklistWidget from "@/components/dashboard/ChecklistWidget";
import AnnouncementList from "@/components/announcements/AnnouncementList";

export const dynamic = "force-dynamic";

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", hover: "hover:border-emerald-500 group-hover:text-emerald-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", hover: "hover:border-amber-500 group-hover:text-amber-700" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", hover: "hover:border-sky-500 group-hover:text-sky-700" },
};

export default async function DashboardPage() {
  const [announcements, settings] = await Promise.all([getAnnouncements(), getDashboardSettings()]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg shadow-emerald-600/10">
        <span className="text-xs font-semibold text-emerald-100 uppercase">지역사회간호학 실습 포털</span>
        <h3 className="text-2xl font-bold mt-1">{settings.heroTitle}</h3>
        <p className="text-sm text-emerald-100 mt-1">{settings.heroSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {settings.quickActions.map((action) => {
          const c = colorClasses[action.color] ?? colorClasses.emerald;
          return (
            <Link
              key={action.href + action.title}
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
            <span className="flex items-center gap-3">
              <Link href="/announcements" className="text-[11px] text-emerald-600 font-bold hover:underline">
                전체 보기 &rarr;
              </Link>
              <Link href="/community" className="text-[11px] text-emerald-600 font-bold hover:underline">
                질문 남기기 &rarr;
              </Link>
            </span>
          </div>
          {announcements.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              등록된 공지사항이 없습니다.
            </p>
          ) : (
            <AnnouncementList
              announcements={announcements}
              className="max-h-[420px] overflow-y-auto custom-scrollbar pr-1"
            />
          )}
        </div>

        <ChecklistWidget items={settings.checklist} />
      </div>
    </div>
  );
}
