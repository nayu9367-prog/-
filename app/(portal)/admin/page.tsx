import { getAnnouncements } from "@/lib/data";
import { getSkills } from "@/lib/skills";
import { getDashboardSettings } from "@/lib/dashboardSettings";
import { getQuizQuestions } from "@/lib/quiz";
import AdminDashboard from "@/components/AdminDashboard";
import SkillsAdmin from "@/components/admin/SkillsAdmin";
import DashboardAdmin from "@/components/admin/DashboardAdmin";
import QuizAdmin from "@/components/admin/QuizAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [announcements, skills, dashboardSettings, quizQuestions] = await Promise.all([
    getAnnouncements(),
    getSkills(),
    getDashboardSettings(),
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
    </div>
  );
}
