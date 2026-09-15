import { getDashboardSettings } from "@/lib/dashboardSettings";
import DashboardAdmin from "@/components/admin/DashboardAdmin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardSettingsPage() {
  const settings = await getDashboardSettings();
  return <DashboardAdmin initialSettings={settings} />;
}
