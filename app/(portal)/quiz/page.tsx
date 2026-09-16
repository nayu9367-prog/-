import Link from "next/link";
import { getQuizQuestions } from "@/lib/quiz";
import QuizPlayer from "@/components/quiz/QuizPlayer";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const questions = await getQuizQuestions();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">지역사회간호학 실습 퀴즈 모듈 🧩</h2>
          <p className="text-xs text-slate-500 mt-1">
            BPRN 공식, OMAHA 체계, 방문간호 감염관리 등 실습 핵심 개념을 점검해보세요.
          </p>
        </div>
        <Link
          href="/quiz/history"
          className="shrink-0 text-xs font-bold text-emerald-600 hover:underline whitespace-nowrap"
        >
          내 기록 보기 &rarr;
        </Link>
      </div>
      <QuizPlayer questions={questions} />
    </div>
  );
}
