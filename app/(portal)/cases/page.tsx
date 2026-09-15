import CaseLibrary from "@/components/cases/CaseLibrary";
import { getVisitCases } from "@/lib/cases";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await getVisitCases();
  return <CaseLibrary cases={cases} />;
}
