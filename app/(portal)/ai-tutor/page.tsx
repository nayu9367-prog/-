import AiTutorChat from "@/components/ai-tutor/AiTutorChat";
import CaseLibrary from "@/components/ai-tutor/CaseLibrary";
import { getVisitCases } from "@/lib/cases";

export const dynamic = "force-dynamic";

export default async function AiTutorPage() {
  const cases = await getVisitCases();
  return (
    <div className="space-y-6">
      <CaseLibrary cases={cases} />
      <AiTutorChat />
    </div>
  );
}
