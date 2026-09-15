import CopyTemplateButton from "@/components/resources/CopyTemplateButton";
import { getResourcesSettings, type ResourceColorKey } from "@/lib/resourcesSettings";

export const dynamic = "force-dynamic";

const COLOR_PRESETS: Record<
  ResourceColorKey,
  { text: string; dot: string; iconColor: string; buttonClass: string }
> = {
  emerald: {
    text: "text-emerald-800",
    dot: "bg-emerald-600",
    iconColor: "text-emerald-600",
    buttonClass: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
  },
  sky: {
    text: "text-sky-800",
    dot: "bg-sky-600",
    iconColor: "text-sky-600",
    buttonClass: "bg-sky-50 hover:bg-sky-100 text-sky-700",
  },
  teal: {
    text: "text-teal-800",
    dot: "bg-teal-600",
    iconColor: "text-teal-600",
    buttonClass: "bg-teal-50 hover:bg-teal-100 text-teal-700",
  },
  amber: {
    text: "text-amber-800",
    dot: "bg-amber-600",
    iconColor: "text-amber-600",
    buttonClass: "bg-amber-50 hover:bg-amber-100 text-amber-700",
  },
};

export default async function ResourcesPage() {
  const settings = await getResourcesSettings();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-folder-open text-amber-500" /> OMAHA 간호진단 체계 영역
          안내서
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {settings.omahaDomains.map((domain) => {
            const c = COLOR_PRESETS[domain.colorKey] ?? COLOR_PRESETS.emerald;
            return (
              <div
                key={domain.title}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <h4 className={`font-bold flex items-center gap-1.5 ${c.text}`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} /> {domain.title}
                </h4>
                <p className="text-slate-600">{domain.desc}</p>
                <span className="text-[11px] text-slate-400">{domain.example}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {settings.templates.map((t) => {
          const c = COLOR_PRESETS[t.colorKey] ?? COLOR_PRESETS.emerald;
          return (
            <div key={t.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <i className={`${t.icon} text-2xl ${c.iconColor}`} />
              <h4 className="font-bold text-slate-800 text-sm">{t.title}</h4>
              <p className="text-xs text-slate-500">{t.desc}</p>
              <div className="flex flex-col gap-2">
                {t.text && <CopyTemplateButton text={t.text} colorClass={c.buttonClass} />}
                {t.fileUrl && (
                  <a
                    href={t.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-center text-xs py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${c.buttonClass}`}
                  >
                    <i className="fa-solid fa-download" /> {t.fileName || "파일 다운로드"}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
