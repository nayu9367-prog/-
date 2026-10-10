import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_SAFETY_ICON,
  SAFETY_BLOCKS,
  getSafetySettings,
  isSafetyIcon,
  updateSafetySettings,
  type SafetyItem,
  type SafetySettings,
} from "@/lib/safetySettings";
import { isUploadedFileUrl } from "@/lib/uploads";

// Returns the cards, or a message naming the first one that can't be saved.
// A row left completely blank is skipped.
function parseItems(value: unknown, heading: string): SafetyItem[] | string {
  if (!Array.isArray(value)) return [];
  const result: SafetyItem[] = [];
  for (const [idx, item] of value.entries()) {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const desc = typeof item?.desc === "string" ? item.desc.trim() : "";
    if (!title && !desc) continue;
    if (!title) return `${heading} 항목 ${idx + 1}: 제목을 입력해주세요.`;
    result.push({ icon: isSafetyIcon(item?.icon) ? item.icon : DEFAULT_SAFETY_ICON, title, desc });
  }
  return result;
}

export async function GET() {
  const settings = await getSafetySettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const blocks = {} as SafetySettings["blocks"];
  for (const block of SAFETY_BLOCKS) {
    const items = parseItems(body?.blocks?.[block.key], block.heading);
    if (typeof items === "string") {
      return NextResponse.json({ error: items }, { status: 400 });
    }
    blocks[block.key] = items;
  }

  const fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl.trim() : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : "";
  if (fileUrl && !isUploadedFileUrl(fileUrl)) {
    return NextResponse.json({ error: "첨부 파일은 파일 선택으로 올린 것만 저장할 수 있습니다." }, { status: 400 });
  }

  const saved = await updateSafetySettings({
    blocks,
    ...(fileUrl ? { fileUrl, ...(fileName ? { fileName } : {}) } : {}),
  });
  return NextResponse.json({ settings: saved });
}
