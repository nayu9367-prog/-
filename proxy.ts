import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/announcements",
    "/api/announcements/:path*",
    "/api/skills",
    "/api/skills/:path*",
    "/api/settings/:path*",
    "/api/quiz",
    "/api/quiz/:path*",
    "/api/upload",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const isValid = await verifySessionToken(token);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/upload")) {
    const isValid = await verifySessionToken(token);
    if (!isValid) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/announcements") ||
    pathname.startsWith("/api/skills") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/quiz")
  ) {
    if (request.method === "GET") {
      return NextResponse.next();
    }
    const isValid = await verifySessionToken(token);
    if (!isValid) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
