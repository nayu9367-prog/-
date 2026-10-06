import { getInstitutionsSettings } from "@/lib/institutionsSettings";
import InstitutionsAdmin from "@/components/admin/InstitutionsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminInstitutionsPage() {
  const settings = await getInstitutionsSettings();
  return <InstitutionsAdmin initialSettings={settings} />;
}
