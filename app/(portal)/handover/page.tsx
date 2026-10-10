import { getHandoverFiles } from "@/lib/handover";
import { getInstitutionsSettings } from "@/lib/institutionsSettings";
import HandoverBoard from "@/components/handover/HandoverBoard";

export const dynamic = "force-dynamic";

export default async function HandoverPage() {
  const [files, institutions] = await Promise.all([getHandoverFiles(), getInstitutionsSettings()]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        실습을 마친 조가 다음 조를 위해 실습기관별 인계 자료(PDF)를 올리는 곳입니다. 파일 이름을
        누르면 열립니다.
      </p>
      <HandoverBoard initialFiles={files} institutions={institutions.items.map((i) => i.name)} />
    </div>
  );
}
