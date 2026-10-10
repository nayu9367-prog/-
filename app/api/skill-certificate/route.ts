import { NextRequest, NextResponse } from "next/server";
import { getSkills } from "@/lib/skills";
import { deleteSkillCertificate, getSkillCertificate, issueSkillCertificate } from "@/lib/skillCertificates";
import { watchKey } from "@/lib/skillWatch";
import { getSessionStudentId } from "@/lib/studentPins";

const NEEDS_STUDENT = "학번 확인이 필요합니다. 학번과 PIN을 다시 입력해주세요.";

// The signed-in student's own certificate, if they have one.
export async function GET(request: NextRequest) {
  const studentId = await getSessionStudentId(request);
  if (!studentId) {
    return NextResponse.json({ error: NEEDS_STUDENT }, { status: 401 });
  }
  return NextResponse.json({ certificate: await getSkillCertificate(studentId) });
}

// The browser reports which videos it has played through; the players give
// that to the page, so the server has no record of its own to check against.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  // The student ID comes from the session, never from the request body.
  const studentId = await getSessionStudentId(request);
  if (!studentId) {
    return NextResponse.json({ error: NEEDS_STUDENT }, { status: 401 });
  }

  const watched: unknown[] = Array.isArray(body?.watched) ? body.watched : [];
  const skills = await getSkills();
  if (skills.length === 0) {
    return NextResponse.json({ error: "등록된 핵심술기 영상이 없습니다." }, { status: 400 });
  }
  if (!skills.every((skill) => watched.includes(watchKey(skill)))) {
    return NextResponse.json({ error: "아직 끝까지 시청하지 않은 영상이 있습니다." }, { status: 400 });
  }

  const certificate = await issueSkillCertificate(
    studentId,
    skills.map((skill) => skill.title)
  );
  return NextResponse.json({ certificate }, { status: 201 });
}

// Admin-only (see proxy.ts).
export async function DELETE(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "학번을 지정해주세요." }, { status: 400 });
  }
  await deleteSkillCertificate(studentId);
  return NextResponse.json({ ok: true });
}
