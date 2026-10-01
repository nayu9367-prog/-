import { NextResponse } from "next/server";
import { getRandomQuizQuestions } from "@/lib/quiz";
import { getQuizSettings } from "@/lib/quizSettings";

export async function GET() {
  const { questionCount } = await getQuizSettings();
  const questions = await getRandomQuizQuestions(questionCount);
  return NextResponse.json({ questions });
}
