import { NextRequest, NextResponse } from "next/server";
import { deleteSkill, updateSkill } from "@/lib/skills";
import { skillCategories, type SkillCategory, type VideoProvider } from "@/lib/skillsData";

const VALID_CATEGORIES = skillCategories.map((c) => c.id).filter((id) => id !== "all");

type RouteContext = { params: Promise<{ id: string }> };

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const cat = typeof body?.cat === "string" ? body.cat : "";
  const tag = typeof body?.tag === "string" ? body.tag.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const desc = typeof body?.desc === "string" ? body.desc.trim() : "";
  const provider = body?.provider === "vimeo" ? "vimeo" : body?.provider === "youtube" ? "youtube" : "";
  const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
  const steps = parseStringArray(body?.steps);

  if (
    !VALID_CATEGORIES.includes(cat as SkillCategory) ||
    !tag ||
    !title ||
    !desc ||
    !provider ||
    !videoId ||
    steps.length === 0
  ) {
    return NextResponse.json(
      { error: "카테고리, 태그, 제목, 설명, 영상 정보, 체크리스트(1개 이상)를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  const skill = await updateSkill(id, {
    cat: cat as SkillCategory,
    tag,
    title,
    desc,
    provider: provider as VideoProvider,
    videoId,
    steps,
  });
  if (!skill) {
    return NextResponse.json({ error: "해당 항목을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ skill });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const deleted = await deleteSkill(id);
  if (!deleted) {
    return NextResponse.json({ error: "해당 항목을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
