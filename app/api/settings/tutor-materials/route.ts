import { NextRequest, NextResponse } from "next/server";
import {
  isTutorMaterialUrl,
  MAX_TUTOR_MATERIALS,
  updateTutorMaterials,
  type TutorMaterial,
} from "@/lib/tutorMaterials";

function parseMaterials(value: unknown): TutorMaterial[] | null {
  if (!Array.isArray(value)) return null;
  const result: TutorMaterial[] = [];
  for (const item of value) {
    const title = typeof item?.title === "string" ? item.title.trim().slice(0, 100) : "";
    const fileUrl = typeof item?.fileUrl === "string" ? item.fileUrl.trim() : "";
    const fileName = typeof item?.fileName === "string" ? item.fileName.trim().slice(0, 150) : "";
    if (!title || !isTutorMaterialUrl(fileUrl)) return null;
    result.push({ title, fileUrl, fileName: fileName || title });
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
  if (materials.length > MAX_TUTOR_MATERIALS) {
    return NextResponse.json(
      { error: `참고자료는 최대 ${MAX_TUTOR_MATERIALS}개까지 등록할 수 있습니다.` },
      { status: 400 }
    );
  }

  const saved = await updateTutorMaterials(materials);
  return NextResponse.json({ materials: saved });
}
