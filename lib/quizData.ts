// An essay question has no options: the student writes an answer, and the
// explanation holds the model answer shown after submitting.
export function isEssayQuestion(question: { options: string[] }): boolean {
  return question.options.length === 0;
}

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  createdAt: string;
};

// What a student's browser gets while the quiz is in progress: no answer or
// explanation, so neither can be read off the network before submitting.
export type QuizQuestionForStudent = Pick<QuizQuestion, "id" | "question" | "options">;

// One graded question, returned by the server once the attempt is submitted.
export type QuizResult = {
  questionId: string;
  question: string;
  options: string[];
  selectedIndex: number | null;
  // What the student wrote, for an essay question; null for multiple choice.
  answerText: string | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};
