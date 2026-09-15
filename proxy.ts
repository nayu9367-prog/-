import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SITE_SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/session";

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
    "/api/cases",
    "/api/cases/:path*",
    "/api/community/:path*",
    "/api/ai-tutor-logs",
    "/api/ai-tutor-logs/:path*",
    "/api/professor-questions",
    "/api/professor-questions/:path*",
    "/api/upload",
    "/((?!_next/static|_next/image|favicon.ico|api|admin|site-login).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const isValid = await verifySessionToken(adminToken);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/ai-tutor-logs") ||
    pathname.startsWith("/api/professor-questions") ||
    pathname.startsWith("/api/community/")
  ) {
    const isValid = await verifySessionToken(adminToken);
    if (!isValid) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/announcements") ||
    pathname.startsWith("/api/skills") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/quiz") ||
    pathname.startsWith("/api/cases")
  ) {
    if (request.method === "GET") {
      return NextResponse.next();
    }
    const isValid = await verifySessionToken(adminToken);
    if (!isValid) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // General site gate: everything else (the student-facing portal) requires
  // either the shared site password or an admin session.
  if (pathname === "/site-login") {
    return NextResponse.next();
  }

  const siteToken = request.cookies.get(SITE_SESSION_COOKIE_NAME)?.value;
  const hasSiteAccess = (await verifySessionToken(siteToken)) || (await verifySessionToken(adminToken));
  if (!hasSiteAccess) {
    const loginUrl = new URL("/site-login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
