import { getSafetySettings } from "@/lib/safetySettings";
import SafetyGuide from "@/components/safety/SafetyGuide";

export const dynamic = "force-dynamic";

export default async function SafetyPage() {
  const settings = await getSafetySettings();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-shield-heart text-emerald-600" /> 안전·인권·감염관리
        </h3>
        <p className="text-sm text-slate-500">실습을 시작하기 전에 네 가지 안내를 차례로 읽어 주세요.</p>
      </div>

      <SafetyGuide settings={settings} />

      {settings.fileUrl && (
        <a
          href={settings.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100"
        >
          <i className="fa-solid fa-download shrink-0" />
          <span className="truncate">{settings.fileName || "안내 자료 내려받기"}</span>
        </a>
      )}
    </div>
  );
}
