import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { updateGroupCodes } from "@/lib/groupCodes";
import {
  MAX_GROUPS,
  MIN_GROUP_CODE_LENGTH,
  normalizeGroupCode,
  type GroupCode,
} from "@/lib/groupCodesData";

// Returns the groups, or a message naming the first thing that can't be
// saved. A row left completely blank is skipped.
function parseGroups(value: unknown): GroupCode[] | string {
  if (!Array.isArray(value)) return [];
  const result: GroupCode[] = [];
  const seen = new Map<string, string>();
  for (const item of value) {
    const name = typeof item?.name === "string" ? item.name.trim().slice(0, 20) : "";
    const code = typeof item?.code === "string" ? item.code.trim().slice(0, 40) : "";
    if (!name && !code) continue;
    if (!name) return "조 이름이 비어 있는 줄이 있습니다. 이름을 입력하거나 그 줄을 삭제해주세요.";
    if (!code) return `${name}: 코드를 입력하거나 이 줄을 삭제해주세요.`;
    if (code.length < MIN_GROUP_CODE_LENGTH) {
      return `${name}: 코드는 ${MIN_GROUP_CODE_LENGTH}자 이상으로 정해주세요.`;
    }
    const other = seen.get(normalizeGroupCode(code));
    if (other) return `${other}와(과) ${name}의 코드가 같습니다. 조마다 다른 코드를 써주세요.`;
    seen.set(normalizeGroupCode(code), name);
    result.push({
      id: typeof item?.id === "string" && item.id ? item.id.slice(0, 40) : randomUUID(),
      name,
      code,
      active: item?.active !== false,
    });
  }
  if (result.length > MAX_GROUPS) return `조는 최대 ${MAX_GROUPS}개까지 등록할 수 있습니다.`;
  return result;
}

// No GET: reading under /api/settings is open to anyone who has entered the
// site, and this list is the codes themselves. The admin page loads it on
// the server.
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const groups = parseGroups(body?.groups);

  if (typeof groups === "string") {
    return NextResponse.json({ error: groups }, { status: 400 });
  }
  const saved = await updateGroupCodes({ groups });
  return NextResponse.json({ settings: saved });
}
