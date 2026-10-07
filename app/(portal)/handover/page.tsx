import { getHandoverNotes } from "@/lib/handover";
import { getInstitutionsSettings } from "@/lib/institutionsSettings";
import HandoverBoard from "@/components/handover/HandoverBoard";

export const dynamic = "force-dynamic";

export default async function HandoverPage() {
  const [notes, institutions] = await Promise.all([getHandoverNotes(), getInstitutionsSettings()]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-right-left text-emerald-600" /> 실습현장 인계사항
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          실습을 마친 조가 다음 조에게 실습기관에서 알아 두면 좋은 점을 남기는 곳입니다. 대상자나
          직원의 개인정보는 적지 말아 주세요.
        </p>
      </div>
      <HandoverBoard initialNotes={notes} institutions={institutions.items.map((i) => i.name)} />
    </div>
  );
}
