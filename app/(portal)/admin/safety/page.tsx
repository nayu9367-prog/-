import { getSafetySettings } from "@/lib/safetySettings";
import SafetyAdmin from "@/components/admin/SafetyAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSafetyPage() {
  const settings = await getSafetySettings();
  return <SafetyAdmin initialSettings={settings} />;
}
