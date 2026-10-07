import { NextRequest, NextResponse } from "next/server";
import { createHandoverNote } from "@/lib/handover";
import { HANDOVER_SECTIONS, MAX_HANDOVER_TEXT_LENGTH } from "@/lib/handoverData";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const institution = text(body?.institution, 60);
  const period = text(body?.period, 60);
  const authorName = text(body?.authorName, 40);
  // Only the form's own headings are accepted; blank ones are left out.
  const sections = HANDOVER_SECTIONS.map((section) => ({
    label: section.label,
    text: text(body?.sections?.[section.key], MAX_HANDOVER_TEXT_LENGTH),
  })).filter((section) => section.text);

  if (!institution || !period || !authorName) {
    return NextResponse.json(
      { error: "실습기관, 실습 시기·조, 작성자를 모두 입력해주세요." },
      { status: 400 }
    );
  }
  if (sections.length === 0) {
    return NextResponse.json({ error: "인계 내용을 한 항목 이상 작성해주세요." }, { status: 400 });
  }

  const note = await createHandoverNote({ institution, period, authorName, sections });
  return NextResponse.json({ note }, { status: 201 });
}
