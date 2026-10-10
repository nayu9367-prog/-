import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSurveyResponses, getSurveySettings, SURVEY_KEYS, SURVEY_LABELS } from "@/lib/surveys";

function formatDateForCell(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Seoul" });
}

// One sheet per survey, one row per student.
export async function GET() {
  const settings = await getSurveySettings();
  const workbook = new ExcelJS.Workbook();

  for (const key of SURVEY_KEYS) {
    const survey = settings[key];
    const responses = await getSurveyResponses(key);
    const sheet = workbook.addWorksheet(SURVEY_LABELS[key]);
    sheet.columns = [
      { header: "학번", key: "studentId", width: 16 },
      ...survey.choiceQuestions.map((q, idx) => ({
        header: `${idx + 1}. ${q.question}`,
        key: `choice${idx}`,
        width: 28,
      })),
      ...(survey.textQuestion ? [{ header: survey.textQuestion, key: "text", width: 60 }] : []),
      { header: "제출일시", key: "submittedAt", width: 20 },
    ];
    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.alignment = { wrapText: true, vertical: "top" };
    header.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    });

    Object.entries(responses)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([studentId, response]) => {
        const row: Record<string, string> = {
          studentId,
          text: response.text,
          submittedAt: formatDateForCell(response.submittedAt),
        };
        survey.choiceQuestions.forEach((q, idx) => {
          // Blank when the questions were changed after this student answered.
          row[`choice${idx}`] = q.options[response.choices[idx]] ?? "";
        });
        sheet.addRow(row);
      });
    if (survey.textQuestion) {
      sheet.getColumn("text").alignment = { wrapText: true, vertical: "top" };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="survey_report_${today}.xlsx"`,
    },
  });
}
