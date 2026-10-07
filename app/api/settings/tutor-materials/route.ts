import { NextRequest, NextResponse } from "next/server";
import {
  isTutorMaterialUrl,
  MAX_TOTAL_PDF_MB,
  MAX_TUTOR_MATERIALS_PER_CATEGORY,
  updateTutorMaterials,
  type TutorMaterial,
} from "@/lib/tutorMaterials";
import { CASE_REPORT_CATEGORY, isTutorCategoryKey, TUTOR_CATEGORIES } from "@/lib/tutorCategories";

function parseMaterials(value: unknown): TutorMaterial[] | null {
  if (!Array.isArray(value)) return null;
  const result: TutorMaterial[] = [];
  for (const item of value) {
    const title = typeof item?.title === "string" ? item.title.trim().slice(0, 100) : "";
    const fileUrl = typeof item?.fileUrl === "string" ? item.fileUrl.trim() : "";
    const fileName = typeof item?.fileName === "string" ? item.fileName.trim().slice(0, 150) : "";
    const caseId = typeof item?.caseId === "string" ? item.caseId.trim().slice(0, 100) : "";
    // A case report belongs to its scenario; anything else, to a topic.
    const category = caseId ? CASE_REPORT_CATEGORY : item?.category;
    if (!title || !isTutorMaterialUrl(fileUrl)) return null;
    if (category !== CASE_REPORT_CATEGORY && !isTutorCategoryKey(category)) return null;
    const size = Number.isFinite(item?.size) && item.size > 0 ? Math.round(item.size) : undefined;
    result.push({
      category,
      ...(caseId ? { caseId } : {}),
      title,
      fileUrl,
      fileName: fileName || title,
      ...(size ? { size } : {}),
    });
  }
  return result;
}

// No GET: the admin page loads the list on the server, and the file URLs
// shouldn't be listable without an admin session.
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const materials = parseMaterials(body?.materials);

  if (!materials) {
    return NextResponse.json(
      { error: "자료마다 제목을 입력하고 PDF 파일을 첨부해주세요." },
      { status: 400 }
    );
  }
  // The limits apply to each set of files that travels together: a topic's
  // materials, or one scenario's case reports.
  const groups = [
    ...TUTOR_CATEGORIES.map((c) => ({
      label: c.label,
      items: materials.filter((m) => m.category === c.key && !m.caseId),
    })),
    ...[...new Set(materials.flatMap((m) => (m.caseId ? [m.caseId] : [])))].map((caseId) => ({
      label: "AI 사례 사례보고서",
      items: materials.filter((m) => m.caseId === caseId),
    })),
  ];
  const overfull = groups.find((g) => g.items.length > MAX_TUTOR_MATERIALS_PER_CATEGORY);
  if (overfull) {
    return NextResponse.json(
      {
        error: `「${overfull.label}」 참고자료는 최대 ${MAX_TUTOR_MATERIALS_PER_CATEGORY}개까지 등록할 수 있습니다.`,
      },
      { status: 400 }
    );
  }

  // Files past the budget would be silently left out of the AI's request,
  // so refuse them here where the admin can see why.
  const oversized = groups.find(
    (g) => g.items.reduce((sum, m) => sum + (m.size ?? 0), 0) > MAX_TOTAL_PDF_MB * 1024 * 1024
  );
  if (oversized) {
    return NextResponse.json(
      {
        error: `「${oversized.label}」 자료의 합계가 ${MAX_TOTAL_PDF_MB}MB를 넘습니다. 자료를 줄이거나 나눠서 올려주세요.`,
      },
      { status: 400 }
    );
  }

  const saved = await updateTutorMaterials(materials);
  return NextResponse.json({ materials: saved });
}
