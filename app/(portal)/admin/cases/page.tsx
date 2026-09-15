import { getVisitCases } from "@/lib/cases";
import CasesAdmin from "@/components/admin/CasesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const cases = await getVisitCases();
  return <CasesAdmin initialCases={cases} />;
}
