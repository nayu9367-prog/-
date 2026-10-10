import Link from "next/link";
import { getRandomQuizQuestions } from "@/lib/quiz";
import { getQuizSettings } from "@/lib/quizSettings";
import QuizPlayer from "@/components/quiz/QuizPlayer";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const { questionCount } = await getQuizSettings();
  const questions = await getRandomQuizQuestions(questionCount);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/quiz/history" className="text-sm font-bold text-emerald-600 hover:underline">
          내 기록 보기 &rarr;
        </Link>
      </div>
      <QuizPlayer initialQuestions={questions} />
    </div>
  );
}
