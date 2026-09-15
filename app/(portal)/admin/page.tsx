import { getAnnouncements } from "@/lib/data";
import { getSkills } from "@/lib/skills";
import { getDashboardSettings } from "@/lib/dashboardSettings";
import { getResourcesSettings } from "@/lib/resourcesSettings";
import { getQuizQuestions } from "@/lib/quiz";
import AdminDashboard from "@/components/AdminDashboard";
import SkillsAdmin from "@/components/admin/SkillsAdmin";
import DashboardAdmin from "@/components/admin/DashboardAdmin";
import ResourcesAdmin from "@/components/admin/ResourcesAdmin";
import QuizAdmin from "@/components/admin/QuizAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [announcements, skills, dashboardSettings, resourcesSettings, quizQuestions] =
    await Promise.all([
      getAnnouncements(),
      getSkills(),
      getDashboardSettings(),
      getResourcesSettings(),
      getQuizQuestions(),
    ]);
  return (
    <div className="flex flex-col gap-10">
      <AdminDashboard initialAnnouncements={announcements} />
      <div className="border-t border-slate-200 pt-8">
        <DashboardAdmin initialSettings={dashboardSettings} />
      </div>
      <div className="border-t border-slate-200 pt-8">
        <QuizAdmin initialQuestions={quizQuestions} />
      </div>
      <div className="border-t border-slate-200 pt-8">
        <SkillsAdmin initialSkills={skills} />
      </div>
      <div className="border-t border-slate-200 pt-8">
        <ResourcesAdmin initialSettings={resourcesSettings} />
      </div>
    </div>
  );
}
