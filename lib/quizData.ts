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
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};
