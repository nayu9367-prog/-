import { NextRequest, NextResponse } from "next/server";
import { createVisitCase, getVisitCases } from "@/lib/cases";

function parseCase(body: unknown) {
  const b = body as Record<string, unknown> | null;
  return {
    category: typeof b?.category === "string" ? b.category.trim() : "",
    title: typeof b?.title === "string" ? b.title.trim() : "",
    summary: typeof b?.summary === "string" ? b.summary.trim() : "",
    patientInfo: typeof b?.patientInfo === "string" ? b.patientInfo.trim() : "",
    assessment: typeof b?.assessment === "string" ? b.assessment.trim() : "",
    omahaDiagnosis: typeof b?.omahaDiagnosis === "string" ? b.omahaDiagnosis.trim() : "",
    interventions: typeof b?.interventions === "string" ? b.interventions.trim() : "",
  };
}

function validate(input: ReturnType<typeof parseCase>): string | null {
  if (!input.category) return "질환/사례 분류를 입력해주세요.";
  if (!input.title) return "사례 제목을 입력해주세요.";
  if (!input.summary) return "한 줄 요약을 입력해주세요.";
  if (!input.patientInfo) return "대상자 정보를 입력해주세요.";
  if (!input.assessment) return "주요 사정 소견을 입력해주세요.";
  if (!input.omahaDiagnosis) return "OMAHA 진단을 입력해주세요.";
  if (!input.interventions) return "간호중재 계획을 입력해주세요.";
  return null;
}

export async function GET() {
  const cases = await getVisitCases();
  return NextResponse.json({ cases });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const input = parseCase(body);
  const error = validate(input);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const created = await createVisitCase(input);
  return NextResponse.json({ case: created }, { status: 201 });
}
