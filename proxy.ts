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
    "/api/student-session",
    "/api/ai-tutor",
    "/api/ai-tutor/:path*",
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
    "/api/handover",
    "/api/handover/:path*",
    "/api/survey",
    "/api/survey/:path*",
    "/api/skill-certificate",
    "/((?!_next/static|_next/image|favicon.ico|api|admin|site-login).*)",
  ],
};

// Abuse-prone endpoints that don't otherwise require a session: brute-force
// login guesses, external-webhook spam, and paid third-party API calls.
//
// Limits are per IP, and a whole class on campus Wi-Fi shares one IP: the
// student-facing limits have to leave room for ~40 students entering the
// site or asking the tutor in the same few minutes. Only the admin login
// (one person) stays tight.
const RATE_LIMITS: { path: string; method: string; name: string; limit: number; windowMs: number }[] = [
  { path: "/api/login", method: "POST", name: "login", limit: 5, windowMs: 5 * 60 * 1000 },
  { path: "/api/site-login", method: "POST", name: "site-login", limit: 60, windowMs: 5 * 60 * 1000 },
  { path: "/api/questions", method: "POST", name: "questions", limit: 15, windowMs: 60 * 1000 },
  { path: "/api/student-session", method: "POST", name: "student-session", limit: 200, windowMs: 5 * 60 * 1000 },
  { path: "/api/ai-tutor", method: "POST", name: "ai-tutor", limit: 120, windowMs: 60 * 1000 },
  { path: "/api/community", method: "POST", name: "community-post", limit: 15, windowMs: 60 * 1000 },
  { path: "/api/handover", method: "POST", name: "handover-post", limit: 15, windowMs: 60 * 1000 },
  { path: "/api/survey", method: "POST", name: "survey-post", limit: 60, windowMs: 60 * 1000 },
  { path: "/api/skill-certificate", method: "POST", name: "skill-certificate", limit: 60, windowMs: 60 * 1000 },
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
    const isValid = await verifySessionToken(adminToken, "admin");
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin-only: dumps every student's ID and quiz performance.
  if (pathname === "/api/quiz/submissions/export") {
    const isAdmin = await verifySessionToken(adminToken, "admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Writing a handover note needs site access; deleting one is admin-only.
  if (pathname.startsWith("/api/handover")) {
    const isAdmin = await verifySessionToken(adminToken, "admin");
    const allowed =
      pathname === "/api/handover" ? isAdmin || (await verifySessionToken(siteToken, "site")) : isAdmin;
    if (!allowed) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admin-only: every survey response.
  if (pathname === "/api/survey/export") {
    const isAdmin = await verifySessionToken(adminToken, "admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // A student's own certificate needs site access (and a student session,
  // checked in the route itself); removing one is admin-only.
  if (pathname === "/api/skill-certificate") {
    const isAdmin = await verifySessionToken(adminToken, "admin");
    const allowed =
      request.method === "DELETE" ? isAdmin : isAdmin || (await verifySessionToken(siteToken, "site"));
    if (!allowed) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Answering a survey needs site access only: the surveys are anonymous.
  if (pathname === "/api/survey") {
    const hasSiteAccess =
      (await verifySessionToken(siteToken, "site")) || (await verifySessionToken(adminToken, "admin"));
    if (!hasSiteAccess) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Student-facing quiz endpoints: need site access, but NOT an admin
  // session (unlike the rest of /api/quiz, which is admin-only for writes).
  if (pathname === "/api/quiz/submit" || pathname === "/api/quiz/history") {
    const hasSiteAccess = (await verifySessionToken(siteToken, "site")) || (await verifySessionToken(adminToken, "admin"));
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
    const isValid = await verifySessionToken(adminToken, "admin");
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
    // Reading is for anyone who has entered the site (the pages fetch these
    // from the browser); it must not be open to the internet at large, or
    // the quiz bank with its answers is one URL away.
    // Except the full question bank, which carries the answers.
    if (request.method === "GET" && pathname !== "/api/quiz") {
      const hasSiteAccess =
        (await verifySessionToken(siteToken, "site")) ||
        (await verifySessionToken(adminToken, "admin"));
      if (!hasSiteAccess) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
      }
      return NextResponse.next();
    }
    const isValid = await verifySessionToken(adminToken, "admin");
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

  const hasSiteAccess = (await verifySessionToken(siteToken, "site")) || (await verifySessionToken(adminToken, "admin"));
  if (!hasSiteAccess) {
    const loginUrl = new URL("/site-login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
