import { NextResponse } from "next/server";
import { deleteAllProfessorQuestions, getProfessorQuestions } from "@/lib/professorQuestions";

export async function GET() {
  const questions = await getProfessorQuestions();
  return NextResponse.json({ questions });
}

export async function DELETE() {
  await deleteAllProfessorQuestions();
  return NextResponse.json({ success: true });
}
