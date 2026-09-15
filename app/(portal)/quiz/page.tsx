import QuizPlayer from "@/components/quiz/QuizPlayer";

export default function QuizPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">지역사회간호학 실습 퀴즈 모듈 🧩</h2>
        <p className="text-xs text-slate-500 mt-1">
          BPRN 공식, OMAHA 체계, 방문간호 감염관리 등 실습 핵심 개념을 점검해보세요.
        </p>
      </div>
      <QuizPlayer />
    </div>
  );
}
