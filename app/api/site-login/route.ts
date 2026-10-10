import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  SITE_SESSION_COOKIE_NAME,
  SITE_SESSION_TTL_MS,
} from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { getActiveGroupCodes, matchGroupCode, recordGroupLogin } from "@/lib/groupCodes";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  // Once group codes are in use they are the only way in: the shared
  // password everyone has seen would otherwise get around them.
  let groups;
  try {
    groups = await getActiveGroupCodes();
  } catch (error) {
    // Without the list there is no telling whether codes are in use, so
    // nobody is let in on the shared password in the meantime.
    console.error("조 코드 확인 실패:", error);
    return NextResponse.json(
      { error: "입장 확인에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }
  if (groups.length > 0) {
    const group = password.trim() ? matchGroupCode(groups, password) : null;
    if (!group) {
      return NextResponse.json({ error: "조 코드가 올바르지 않습니다." }, { status: 401 });
    }
    try {
      await recordGroupLogin(group.id);
    } catch (error) {
      // The count is for the professor's information; it mustn't keep a
      // student out.
      console.error("조 입장 기록 실패:", error);
    }
  } else {
    const sitePasswordHash = process.env.SITE_PASSWORD_HASH;
    if (!sitePasswordHash) {
      return NextResponse.json(
        { error: "서버에 입장 비밀번호(SITE_PASSWORD_HASH)가 설정되지 않았습니다." },
        { status: 500 }
      );
    }
    const isValid = password.length > 0 && (await verifyPassword(password, sitePasswordHash));
    if (!isValid) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
  }

  const token = await createSessionToken("site", SITE_SESSION_TTL_MS);
  const response = NextResponse.json({ success: true });
  response.cookies.set(SITE_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_SESSION_TTL_MS / 1000,
  });
  return response;
}
