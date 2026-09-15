import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  SITE_SESSION_COOKIE_NAME,
  SITE_SESSION_TTL_MS,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json(
      { error: "서버에 입장 비밀번호(SITE_PASSWORD)가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (password !== sitePassword) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = await createSessionToken(SITE_SESSION_TTL_MS);
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
