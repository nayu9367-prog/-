import { getQuizQuestions } from "@/lib/quiz";
import QuizAdmin from "@/components/admin/QuizAdmin";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const questions = await getQuizQuestions();
  return <QuizAdmin initialQuestions={questions} />;
}
