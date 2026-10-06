import { NextRequest, NextResponse } from "next/server";
import {
  getInstitutionsSettings,
  updateInstitutionsSettings,
  type Institution,
} from "@/lib/institutionsSettings";

// Returns the institutions, or a message naming the first one that can't be
// saved. A row left completely blank is skipped.
function parseItems(value: unknown): Institution[] | string {
  if (!Array.isArray(value)) return [];
  const result: Institution[] = [];
  for (const [idx, item] of value.entries()) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    const address = typeof item?.address === "string" ? item.address.trim() : "";
    const phone = typeof item?.phone === "string" ? item.phone.trim() : "";
    const note = typeof item?.note === "string" ? item.note.trim() : "";
    if (!name && !address && !phone && !note) continue;
    if (!name) return `기관 ${idx + 1}: 기관 이름을 입력해주세요.`;
    result.push({ name, address, phone, note });
  }
  return result;
}

export async function GET() {
  const settings = await getInstitutionsSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const items = parseItems(body?.items);

  if (typeof items === "string") {
    return NextResponse.json({ error: items }, { status: 400 });
  }
  const saved = await updateInstitutionsSettings({ items });
  return NextResponse.json({ settings: saved });
}
