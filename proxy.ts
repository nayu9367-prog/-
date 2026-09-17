import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SITE_SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/login",
    "/api/site-login",
    "/api/questions",
    "/api/ai-tutor",
    "/api/community",
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

// Abuse-prone endpoints that don't otherwise require a session: brute-force
// login guesses, external-webhook spam, and paid third-party API calls.
const RATE_LIMITS: { path: string; method: string; name: string; limit: number; windowMs: number }[] = [
  { path: "/api/login", method: "POST", name: "login", limit: 5, windowMs: 5 * 60 * 1000 },
  { path: "/api/site-login", method: "POST", name: "site-login", limit: 5, windowMs: 5 * 60 * 1000 },
  { path: "/api/questions", method: "POST", name: "questions", limit: 5, windowMs: 60 * 1000 },
  { path: "/api/ai-tutor", method: "POST", name: "ai-tutor", limit: 10, windowMs: 60 * 1000 },
  { path: "/api/community", method: "POST", name: "community-post", limit: 5, windowMs: 60 * 1000 },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const siteToken = request.cookies.get(SITE_SESSION_COOKIE_NAME)?.value;

  for (const rule of RATE_LIMITS) {
    if (pathname === rule.path && request.method === rule.method) {
      const limited = rateLimit(request, rule.name, rule.limit, rule.windowMs);
      if (limited) return limited;
      break;
    }
  }

  // These two issue the session cookies, so they must stay reachable
  // without one — only rate-limited above, never gated.
  if (pathname === "/api/login" || pathname === "/api/site-login") {
    return NextResponse.next();
  }

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

  // Admin-only: dumps every student's ID and quiz performance.
  if (pathname === "/api/quiz/submissions/export") {
    const isAdmin = await verifySessionToken(adminToken);
    if (!isAdmin) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Student-facing quiz endpoints: need site access, but NOT an admin
  // session (unlike the rest of /api/quiz, which is admin-only for writes).
  if (pathname === "/api/quiz/submit" || pathname === "/api/quiz/history") {
    const hasSiteAccess = (await verifySessionToken(siteToken)) || (await verifySessionToken(adminToken));
    if (!hasSiteAccess) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
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

  const hasSiteAccess = (await verifySessionToken(siteToken)) || (await verifySessionToken(adminToken));
  if (!hasSiteAccess) {
    const loginUrl = new URL("/site-login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
