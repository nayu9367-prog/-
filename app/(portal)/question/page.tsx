import QuestionForm from "@/components/QuestionForm";

export default function QuestionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-envelope-open-text text-emerald-600" /> 교수님께 질문
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          이름, 학번과 함께 질문을 남기면 담당 교수님께 바로 전달됩니다.
        </p>
      </div>
      <QuestionForm />
    </div>
  );
}
