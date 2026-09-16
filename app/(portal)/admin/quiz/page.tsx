import { getQuizQuestions, getQuizStats, getQuizSubmissions } from "@/lib/quiz";
import QuizAdmin from "@/components/admin/QuizAdmin";
import QuizStatsView from "@/components/admin/QuizStatsView";
import QuizSubmissionsView from "@/components/admin/QuizSubmissionsView";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const [questions, stats, submissions] = await Promise.all([
    getQuizQuestions(),
    getQuizStats(),
    getQuizSubmissions(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <QuizStatsView stats={stats} />
      <QuizSubmissionsView submissions={submissions} />
      <QuizAdmin initialQuestions={questions} />
    </div>
  );
}
