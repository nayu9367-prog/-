import { NextRequest, NextResponse } from "next/server";
import {
  getReferenceVideosSettings,
  parseYouTubeId,
  updateReferenceVideosSettings,
  type ReferenceVideo,
} from "@/lib/referenceVideos";

// Returns the videos, or a message naming the first one that can't be
// saved. A row left completely blank is skipped.
function parseItems(value: unknown): ReferenceVideo[] | string {
  if (!Array.isArray(value)) return [];
  const result: ReferenceVideo[] = [];
  for (const [idx, item] of value.entries()) {
    const title = typeof item?.title === "string" ? item.title.trim().slice(0, 100) : "";
    const url = typeof item?.url === "string" ? item.url.trim().slice(0, 300) : "";
    const desc = typeof item?.desc === "string" ? item.desc.trim().slice(0, 500) : "";
    if (!title && !url && !desc) continue;
    if (!title) return `영상 ${idx + 1}: 제목을 입력해주세요.`;
    if (!url) return `영상 ${idx + 1}: 유튜브 링크를 입력해주세요.`;
    const videoId = parseYouTubeId(url);
    if (!videoId) return `영상 ${idx + 1}: 유튜브 링크가 아닙니다. 주소를 다시 확인해주세요.`;
    result.push({ title, url, videoId, desc });
  }
  return result;
}

export async function GET() {
  const settings = await getReferenceVideosSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const items = parseItems(body?.items);

  if (typeof items === "string") {
    return NextResponse.json({ error: items }, { status: 400 });
  }
  const saved = await updateReferenceVideosSettings({ items });
  return NextResponse.json({ settings: saved });
}
