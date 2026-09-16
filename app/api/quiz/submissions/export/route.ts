import { NextResponse } from "next/server";
import { getQuizSubmissions } from "@/lib/quiz";

function csvCell(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatDateForCsv(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export async function GET() {
  const submissions = await getQuizSubmissions();

  const header = ["학번", "점수", "정답수", "총문항수", "제출일시"];
  const rows = submissions.map((s) => [
    s.studentId,
    s.score,
    s.correctCount,
    s.totalCount,
    formatDateForCsv(s.createdAt),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const csvWithBom = "﻿" + csv;

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quiz_submissions_${today}.csv"`,
    },
  });
}
