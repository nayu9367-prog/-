import { getAnnouncements } from "@/lib/data";
import { getSkills } from "@/lib/skills";
import AdminDashboard from "@/components/AdminDashboard";
import SkillsAdmin from "@/components/admin/SkillsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [announcements, skills] = await Promise.all([getAnnouncements(), getSkills()]);
  return (
    <div className="flex flex-col gap-10">
      <AdminDashboard initialAnnouncements={announcements} />
      <div className="border-t border-slate-200 pt-8">
        <SkillsAdmin initialSkills={skills} />
      </div>
    </div>
  );
}
