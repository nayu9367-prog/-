import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    return NextResponse.json(
      { error: "서버에 관리자 비밀번호(ADMIN_PASSWORD_HASH)가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const isValid = password.length > 0 && (await verifyPassword(password, adminPasswordHash));
  if (!isValid) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return response;
}
