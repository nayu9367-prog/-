import { getResourcesSettings, type ResourceColorKey } from "@/lib/resourcesSettings";

export const dynamic = "force-dynamic";

const COLOR_PRESETS: Record<
  ResourceColorKey,
  { iconColor: string; buttonClass: string }
> = {
  emerald: {
    iconColor: "text-emerald-600",
    buttonClass: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
  },
  sky: {
    iconColor: "text-sky-600",
    buttonClass: "bg-sky-50 hover:bg-sky-100 text-sky-700",
  },
  teal: {
    iconColor: "text-teal-600",
    buttonClass: "bg-teal-50 hover:bg-teal-100 text-teal-700",
  },
  amber: {
    iconColor: "text-amber-600",
    buttonClass: "bg-amber-50 hover:bg-amber-100 text-amber-700",
  },
};

export default async function ResourcesPage() {
  const settings = await getResourcesSettings();
  const templates = settings.templates.filter((t) => t.fileUrl);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <i className="fa-solid fa-folder-open text-amber-500" /> 실습 서식
      </h3>

      {templates.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 등록된 서식이 없습니다.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((t) => {
          const c = COLOR_PRESETS[t.colorKey] ?? COLOR_PRESETS.emerald;
          return (
            <div key={t.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <i className={`${t.icon} text-2xl ${c.iconColor}`} />
              <h4 className="font-bold text-slate-800 text-sm">{t.title}</h4>
              {t.desc && <p className="text-xs text-slate-500">{t.desc}</p>}
              <a
                href={t.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center text-xs py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${c.buttonClass}`}
              >
                <i className="fa-solid fa-download shrink-0" />
                <span className="truncate">{t.fileName || "파일 다운로드"}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
