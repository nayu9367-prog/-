import { NextRequest, NextResponse } from "next/server";
import {
  getResourcesSettings,
  updateResourcesSettings,
  RESOURCE_COLOR_KEYS,
  type ResourcesSettings,
  type OmahaDomain,
  type ResourceTemplate,
  type ResourceColorKey,
} from "@/lib/resourcesSettings";

function isValidColorKey(value: unknown): value is ResourceColorKey {
  return RESOURCE_COLOR_KEYS.includes(value as ResourceColorKey);
}

function parseOmahaDomains(value: unknown): OmahaDomain[] {
  if (!Array.isArray(value)) return [];
  const result: OmahaDomain[] = [];
  for (const item of value) {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const desc = typeof item?.desc === "string" ? item.desc.trim() : "";
    const example = typeof item?.example === "string" ? item.example.trim() : "";
    const colorKey = isValidColorKey(item?.colorKey) ? item.colorKey : "";
    if (title && desc && example && colorKey) {
      result.push({ title, desc, example, colorKey });
    }
  }
  return result;
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
  const omahaDomains = parseOmahaDomains(body?.omahaDomains);
  const templates = parseTemplates(body?.templates);

  if (omahaDomains.length === 0 || templates.length === 0) {
    return NextResponse.json(
      { error: "OMAHA 영역(1개 이상)과 실습 서식(1개 이상)을 모두 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  const settings: ResourcesSettings = { omahaDomains, templates };
  const saved = await updateResourcesSettings(settings);
  return NextResponse.json({ settings: saved });
}
