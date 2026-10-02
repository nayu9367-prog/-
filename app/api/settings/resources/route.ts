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

function parseTemplates(value: unknown): ResourceTemplate[] {
  if (!Array.isArray(value)) return [];
  const result: ResourceTemplate[] = [];
  for (const item of value) {
    const icon = typeof item?.icon === "string" ? item.icon.trim() : "";
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const desc = typeof item?.desc === "string" ? item.desc.trim() : "";
    const text = typeof item?.text === "string" ? item.text.trim() : "";
    const fileUrl = typeof item?.fileUrl === "string" ? item.fileUrl.trim() : "";
    const fileName = typeof item?.fileName === "string" ? item.fileName.trim() : "";
    const colorKey = isValidColorKey(item?.colorKey) ? item.colorKey : "";
    if (icon && title && desc && colorKey && (text || fileUrl)) {
      result.push({
        icon,
        title,
        desc,
        colorKey,
        ...(text ? { text } : {}),
        ...(fileUrl ? { fileUrl, fileName: fileName || undefined } : {}),
      });
    }
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

  if (templates.length === 0) {
    return NextResponse.json(
      { error: "실습 서식을 1개 이상 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  const settings: ResourcesSettings = { templates };
  const saved = await updateResourcesSettings(settings);
  return NextResponse.json({ settings: saved });
}
