import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSurveyResponses, getSurveySettings, SURVEY_KEYS, SURVEY_LABELS } from "@/lib/surveys";

// The day only: in a small class the minute a response came in could point
// to who wrote it.
function formatDateForCell(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", { dateStyle: "short", timeZone: "Asia/Seoul" });
}

// One sheet per survey, one row per (anonymous) response.
export async function GET() {
  const settings = await getSurveySettings();
  const workbook = new ExcelJS.Workbook();

  for (const key of SURVEY_KEYS) {
    const survey = settings[key];
    const responses = await getSurveyResponses(key);
    const sheet = workbook.addWorksheet(SURVEY_LABELS[key]);
    sheet.columns = [
      { header: "번호", key: "number", width: 8 },
      ...survey.choiceQuestions.map((q, idx) => ({
        header: `${idx + 1}. ${q.question}`,
        key: `choice${idx}`,
        width: 28,
      })),
      ...(survey.textQuestion ? [{ header: survey.textQuestion, key: "text", width: 60 }] : []),
      { header: "제출일", key: "submittedAt", width: 14 },
    ];
    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.alignment = { wrapText: true, vertical: "top" };
    header.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    });

    Object.values(responses)
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
      .forEach((response, index) => {
        const row: Record<string, string | number> = {
          number: index + 1,
          text: response.text,
          submittedAt: formatDateForCell(response.submittedAt),
        };
        survey.choiceQuestions.forEach((q, idx) => {
          // Blank when the questions were changed after this response came in.
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
