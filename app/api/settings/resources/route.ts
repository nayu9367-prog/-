import { NextRequest, NextResponse } from "next/server";
import {
  getResourcesSettings,
  updateResourcesSettings,
  RESOURCE_COLOR_KEYS,
  type ResourcesSettings,
  type ResourceTemplate,
  type ResourceColorKey,
} from "@/lib/resourcesSettings";

function isValidColorKey(value: unknown): value is ResourceColorKey {
  return RESOURCE_COLOR_KEYS.includes(value as ResourceColorKey);
}

// Returns the forms, or a message naming the first one that can't be saved.
// A row left completely blank is skipped; a half-filled one is an error, so
// that an uploaded file never quietly disappears on save.
function parseTemplates(value: unknown): ResourceTemplate[] | string {
  if (!Array.isArray(value)) return [];
  const result: ResourceTemplate[] = [];
  for (const [idx, item] of value.entries()) {
    const icon = typeof item?.icon === "string" ? item.icon.trim() : "";
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const desc = typeof item?.desc === "string" ? item.desc.trim() : "";
    const text = typeof item?.text === "string" ? item.text.trim() : "";
    const fileUrl = typeof item?.fileUrl === "string" ? item.fileUrl.trim() : "";
    const fileName = typeof item?.fileName === "string" ? item.fileName.trim() : "";
    const colorKey = isValidColorKey(item?.colorKey) ? item.colorKey : "emerald";

    if (!title && !desc && !text && !fileUrl) continue;
    if (!title) return `서식 ${idx + 1}: 서식 제목을 입력해주세요.`;
    if (!text && !fileUrl) {
      return `서식 ${idx + 1}: 양식 텍스트를 입력하거나 파일을 첨부해주세요.`;
    }
    result.push({
      icon: icon || "fa-solid fa-file",
      title,
      desc,
      colorKey,
      ...(text ? { text } : {}),
      ...(fileUrl ? { fileUrl, fileName: fileName || undefined } : {}),
    });
  }
  return result;
}

export async function GET() {
  const settings = await getResourcesSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const templates = parseTemplates(body?.templates);

  if (typeof templates === "string") {
    return NextResponse.json({ error: templates }, { status: 400 });
  }
  if (templates.length === 0) {
    return NextResponse.json(
      { error: "실습 서식을 1개 이상 입력해주세요." },
      { status: 400 }
    );
  }

  const settings: ResourcesSettings = { templates };
  const saved = await updateResourcesSettings(settings);
  return NextResponse.json({ settings: saved });
}
