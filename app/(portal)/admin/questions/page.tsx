import { getProfessorQuestionCount, getProfessorQuestions } from "@/lib/professorQuestions";
import ProfessorQuestionsView from "@/components/admin/ProfessorQuestionsView";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const [questions, count] = await Promise.all([
    getProfessorQuestions(),
    getProfessorQuestionCount(),
  ]);

  return <ProfessorQuestionsView initialQuestions={questions} totalCount={count} />;
}
