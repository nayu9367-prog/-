import Link from "next/link";
import QuizHistory from "@/components/quiz/QuizHistory";

export default function QuizHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800">내 퀴즈 기록 🗂️</h2>
        <Link href="/quiz" className="text-xs font-bold text-emerald-600 hover:underline">
          &larr; 퀴즈 풀러 가기
        </Link>
      </div>
      <QuizHistory />
    </div>
  );
}
