import QuestionForm from "@/components/QuestionForm";

export default function QuestionPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        이름, 학번과 함께 질문을 남기면 담당 교수님께 바로 전달됩니다.
      </p>
      <QuestionForm />
    </div>
  );
}
