import { NextResponse } from "next/server";
import { getQuizSubmissions, getQuizStats } from "@/lib/quiz";

function csvCell(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

function formatDateForCsv(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export async function GET() {
  const [submissions, stats] = await Promise.all([getQuizSubmissions(), getQuizStats()]);

  const submissionLines = [
    csvRow(["학생 응시 기록"]),
    csvRow(["학번", "점수", "정답수", "총문항수", "제출일시"]),
    ...submissions.map((s) =>
      csvRow([s.studentId, s.score, s.correctCount, s.totalCount, formatDateForCsv(s.createdAt)])
    ),
  ];

  const questionLines = [
    csvRow(["문항별 오답률 (오답률 높은 순)"]),
    csvRow(["문항", "오답률(%)", "오답수", "정답수", "전체 응시수"]),
    ...stats.questionStats.map((q) =>
      csvRow([q.questionText, q.wrongRate, q.wrongAnswers, q.correctAnswers, q.totalAnswers])
    ),
  ];

  const csv = [...submissionLines, "", ...questionLines].join("\r\n");
  const csvWithBom = "﻿" + csv;

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quiz_report_${today}.csv"`,
    },
  });
}
