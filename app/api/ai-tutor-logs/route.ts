import { NextResponse } from "next/server";
import { deleteAllAiTutorLogs, getAiTutorLogs } from "@/lib/aiTutorLogs";

export async function GET() {
  const logs = await getAiTutorLogs();
  return NextResponse.json({ logs });
}

export async function DELETE() {
  await deleteAllAiTutorLogs();
  return NextResponse.json({ success: true });
}
