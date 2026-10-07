import { getHandoverNotes } from "@/lib/handover";
import HandoverBoard from "@/components/handover/HandoverBoard";

export const dynamic = "force-dynamic";

export default async function AdminHandoverPage() {
  const notes = await getHandoverNotes();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">실습현장 인계사항 관리</h2>
        <p className="text-sm text-slate-500 mt-1">
          학생들이 남긴 인계사항을 확인하고, 부적절한 글은 삭제할 수 있습니다.
        </p>
      </div>
      <HandoverBoard initialNotes={notes} institutions={[]} admin />
    </div>
  );
}
