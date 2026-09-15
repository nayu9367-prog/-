import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardSettings,
  updateDashboardSettings,
  type DashboardSettings,
  type QuickAction,
  type QuickActionColor,
} from "@/lib/dashboardSettings";

const VALID_COLORS: QuickActionColor[] = ["emerald", "amber", "sky"];

function parseQuickActions(value: unknown): QuickAction[] {
  if (!Array.isArray(value)) return [];
  const result: QuickAction[] = [];
  for (const item of value) {
    const icon = typeof item?.icon === "string" ? item.icon.trim() : "";
    const color = VALID_COLORS.includes(item?.color) ? (item.color as QuickActionColor) : "";
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const desc = typeof item?.desc === "string" ? item.desc.trim() : "";
    const href = typeof item?.href === "string" ? item.href.trim() : "";
    const cta = typeof item?.cta === "string" ? item.cta.trim() : "";
    if (icon && color && title && desc && href && cta) {
      result.push({ icon, color: color as QuickActionColor, title, desc, href, cta });
    }
  }
  return result;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET() {
  const settings = await getDashboardSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const heroTitle = typeof body?.heroTitle === "string" ? body.heroTitle.trim() : "";
  const heroSubtitle = typeof body?.heroSubtitle === "string" ? body.heroSubtitle.trim() : "";
  const quickActions = parseQuickActions(body?.quickActions);
  const checklist = parseStringArray(body?.checklist);

  if (!heroTitle || !heroSubtitle || quickActions.length === 0 || checklist.length === 0) {
    return NextResponse.json(
      { error: "환영 문구, 바로가기 카드(1개 이상), 체크리스트(1개 이상)를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  const settings: DashboardSettings = { heroTitle, heroSubtitle, quickActions, checklist };
  const saved = await updateDashboardSettings(settings);
  return NextResponse.json({ settings: saved });
}
