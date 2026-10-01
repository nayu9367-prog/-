import { NextRequest, NextResponse } from "next/server";
import { normalizeStudentId, resetStudentPin } from "@/lib/studentPins";

// Admin-only (the proxy gates non-GET requests under /api/settings).
export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const studentId = normalizeStudentId(body?.studentId);
  if (!studentId) {
    return NextResponse.json({ error: "학번을 입력해주세요." }, { status: 400 });
  }

  const removed = await resetStudentPin(studentId);
  if (!removed) {
    return NextResponse.json({ error: "PIN이 등록된 학번이 아닙니다." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
