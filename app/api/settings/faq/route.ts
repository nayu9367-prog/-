import { NextRequest, NextResponse } from "next/server";
import { getFaqSettings, updateFaqSettings, type FaqItem } from "@/lib/faqSettings";

// Returns the questions, or a message naming the first one that can't be
// saved. A row left completely blank is skipped.
function parseItems(value: unknown): FaqItem[] | string {
  if (!Array.isArray(value)) return [];
  const result: FaqItem[] = [];
  for (const [idx, item] of value.entries()) {
    const question = typeof item?.question === "string" ? item.question.trim() : "";
    const answer = typeof item?.answer === "string" ? item.answer.trim() : "";
    if (!question && !answer) continue;
    if (!question) return `질문 ${idx + 1}: 질문을 입력해주세요.`;
    if (!answer) return `질문 ${idx + 1}: 답변을 입력해주세요.`;
    result.push({ question, answer });
  }
  return result;
}

export async function GET() {
  const settings = await getFaqSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const items = parseItems(body?.items);

  if (typeof items === "string") {
    return NextResponse.json({ error: items }, { status: 400 });
  }
  const saved = await updateFaqSettings({ items });
  return NextResponse.json({ settings: saved });
}
