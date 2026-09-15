import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "";
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 100) : "";

  if (!path || !visitorId || path.startsWith("/admin")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await recordPageView(path, visitorId);
  } catch (error) {
    console.error("페이지뷰 기록 실패:", error);
  }

  return NextResponse.json({ ok: true });
}
