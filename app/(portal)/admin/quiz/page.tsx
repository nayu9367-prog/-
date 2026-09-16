import { getQuizQuestions, getQuizStats } from "@/lib/quiz";
import QuizAdmin from "@/components/admin/QuizAdmin";
import QuizStatsView from "@/components/admin/QuizStatsView";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const [questions, stats] = await Promise.all([getQuizQuestions(), getQuizStats()]);
  return (
    <div className="flex flex-col gap-6">
      <QuizStatsView stats={stats} />
      <QuizAdmin initialQuestions={questions} />
    </div>
  );
}
