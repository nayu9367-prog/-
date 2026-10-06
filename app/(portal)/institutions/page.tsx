import { getInstitutionsSettings } from "@/lib/institutionsSettings";

export const dynamic = "force-dynamic";

export default async function InstitutionsPage() {
  const { items } = await getInstitutionsSettings();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <i className="fa-solid fa-hospital text-emerald-600" /> 실습기관 정보
      </h3>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 등록된 실습기관이 없습니다.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {item.address && (
                <p className="flex gap-2">
                  <i className="fa-solid fa-location-dot w-4 pt-0.5 text-emerald-600" />
                  <span>{item.address}</span>
                </p>
              )}
              {item.phone && (
                <p className="flex gap-2">
                  <i className="fa-solid fa-phone w-4 pt-0.5 text-emerald-600" />
                  <a href={`tel:${item.phone}`} className="hover:underline">
                    {item.phone}
                  </a>
                </p>
              )}
            </div>
            {item.note && (
              <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {item.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
