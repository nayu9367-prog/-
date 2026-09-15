import { getAnnouncements } from "@/lib/data";
import { getSkills } from "@/lib/skills";
import { getDashboardSettings } from "@/lib/dashboardSettings";
import AdminDashboard from "@/components/AdminDashboard";
import SkillsAdmin from "@/components/admin/SkillsAdmin";
import DashboardAdmin from "@/components/admin/DashboardAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [announcements, skills, dashboardSettings] = await Promise.all([
    getAnnouncements(),
    getSkills(),
    getDashboardSettings(),
  ]);
  return (
    <div className="flex flex-col gap-10">
      <AdminDashboard initialAnnouncements={announcements} />
      <div className="border-t border-slate-200 pt-8">
        <DashboardAdmin initialSettings={dashboardSettings} />
      </div>
      <div className="border-t border-slate-200 pt-8">
        <SkillsAdmin initialSkills={skills} />
      </div>
    </div>
  );
}
