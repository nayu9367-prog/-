import { NextRequest, NextResponse } from "next/server";
import { deleteVisitCase, updateVisitCase } from "@/lib/cases";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const input = parseCase(body);
  const error = validate(input);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const updated = await updateVisitCase(id, input);
  if (!updated) {
    return NextResponse.json({ error: "해당 시나리오를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ case: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteVisitCase(id);
  if (!deleted) {
    return NextResponse.json({ error: "해당 시나리오를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
