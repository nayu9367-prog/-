import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getQuizSubmissions, getQuizStats } from "@/lib/quiz";

function formatDateForCell(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true };
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
  });
}

export async function GET() {
  const [submissions, stats] = await Promise.all([getQuizSubmissions(), getQuizStats()]);

  const workbook = new ExcelJS.Workbook();

  const submissionSheet = workbook.addWorksheet("응시기록");
  submissionSheet.columns = [
    { header: "학번", key: "studentId", width: 16 },
    { header: "점수", key: "score", width: 10 },
    { header: "정답수", key: "correctCount", width: 10 },
    { header: "총문항수", key: "totalCount", width: 10 },
    { header: "제출일시", key: "createdAt", width: 20 },
  ];
  styleHeaderRow(submissionSheet.getRow(1));
  submissions.forEach((s) => {
    submissionSheet.addRow({
      studentId: s.studentId || "미입력",
      score: s.score,
      correctCount: s.correctCount,
      totalCount: s.totalCount,
      createdAt: formatDateForCell(s.createdAt),
    });
  });

  const statsSheet = workbook.addWorksheet("문항별 오답률");
  statsSheet.columns = [
    { header: "문항", key: "questionText", width: 60 },
    { header: "오답률(%)", key: "wrongRate", width: 12 },
    { header: "오답수", key: "wrongAnswers", width: 10 },
    { header: "정답수", key: "correctAnswers", width: 10 },
    { header: "전체 응시수", key: "totalAnswers", width: 12 },
  ];
  styleHeaderRow(statsSheet.getRow(1));
  stats.questionStats.forEach((q) => {
    statsSheet.addRow({
      questionText: q.questionText,
      wrongRate: q.wrongRate,
      wrongAnswers: q.wrongAnswers,
      correctAnswers: q.correctAnswers,
      totalAnswers: q.totalAnswers,
    });
  });
  statsSheet.getColumn("questionText").alignment = { wrapText: true, vertical: "top" };

  const buffer = await workbook.xlsx.writeBuffer();
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="quiz_report_${today}.xlsx"`,
    },
  });
}
