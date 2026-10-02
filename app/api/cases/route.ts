import { NextRequest, NextResponse } from "next/server";
import { createVisitCase, getVisitCases } from "@/lib/cases";

function parseCase(body: unknown) {
  const b = body as Record<string, unknown> | null;
  return {
    name: typeof b?.name === "string" ? b.name.trim().slice(0, 50) : "",
    scenario: typeof b?.scenario === "string" ? b.scenario.trim() : "",
  };
}

function validate(input: ReturnType<typeof parseCase>): string | null {
  if (!input.name) return "대상자 이름을 입력해주세요.";
  if (!input.scenario) return "시나리오 내용을 입력해주세요.";
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
