import { getHandoverFiles } from "@/lib/handover";
import { getInstitutionsSettings } from "@/lib/institutionsSettings";
import HandoverBoard from "@/components/handover/HandoverBoard";

export const dynamic = "force-dynamic";

export default async function AdminHandoverPage() {
  const [files, institutions] = await Promise.all([getHandoverFiles(), getInstitutionsSettings()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">실습현장 인계사항 관리</h2>
        <p className="text-sm text-slate-500 mt-1">
          학생들이 올린 인계 자료(PDF)를 실습기관별로 확인하고, 부적절한 파일은 삭제할 수 있습니다.
          새 자료는 학생 화면의 실습현장 인계사항에서 올립니다.
        </p>
      </div>
      <HandoverBoard initialFiles={files} institutions={institutions.items.map((i) => i.name)} admin />
    </div>
  );
}
