import { NextRequest, NextResponse } from "next/server";
import {
  createStudentSessionToken,
  STUDENT_SESSION_COOKIE_NAME,
  STUDENT_SESSION_TTL_MS,
} from "@/lib/session";
import {
  getSessionStudentId,
  isStudentRegistered,
  normalizeStudentId,
  PIN_PATTERN,
  registerStudentPin,
  verifyStudentPin,
} from "@/lib/studentPins";

// Who the browser is currently signed in as, if anyone.
export async function GET(request: NextRequest) {
  return NextResponse.json({ studentId: await getSessionStudentId(request) });
}

// Without a PIN: reports whether the student ID already has one, so the
// form knows whether to ask for it or for a new one.
// With a PIN: sets it (first use of the ID) or checks it, then signs in.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const studentId = normalizeStudentId(body?.studentId);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!studentId) {
    return NextResponse.json({ error: "학번을 입력해주세요." }, { status: 400 });
  }
  if (!pin) {
    return NextResponse.json({ registered: await isStudentRegistered(studentId) });
  }
  if (!PIN_PATTERN.test(pin)) {
    return NextResponse.json({ error: "PIN은 숫자 4자리로 입력해주세요." }, { status: 400 });
  }

  const created = await registerStudentPin(studentId, pin);
  if (!created) {
    const check = await verifyStudentPin(studentId, pin);
    if (check === "locked") {
      return NextResponse.json(
        { error: "PIN을 여러 번 틀려 잠시 잠겼습니다. 10분 뒤 다시 시도하거나 교수님께 문의해주세요." },
        { status: 429 }
      );
    }
    if (check === "wrong") {
      return NextResponse.json(
        { error: "PIN이 올바르지 않습니다. PIN을 잊었다면 교수님께 초기화를 요청해주세요." },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.json({ studentId, created });
  response.cookies.set(STUDENT_SESSION_COOKIE_NAME, await createStudentSessionToken(studentId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STUDENT_SESSION_TTL_MS / 1000,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(STUDENT_SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
