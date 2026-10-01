import { getQuizQuestions, getQuizStats, getQuizSubmissions } from "@/lib/quiz";
import { getQuizSettings } from "@/lib/quizSettings";
import QuizAdmin from "@/components/admin/QuizAdmin";
import QuizStatsView from "@/components/admin/QuizStatsView";
import QuizSubmissionsView from "@/components/admin/QuizSubmissionsView";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const [questions, stats, submissions, settings] = await Promise.all([
    getQuizQuestions(),
    getQuizStats(),
    getQuizSubmissions(),
    getQuizSettings(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <QuizStatsView stats={stats} />
      <QuizSubmissionsView submissions={submissions} />
      <QuizAdmin initialQuestions={questions} initialSettings={settings} />
    </div>
  );
}
