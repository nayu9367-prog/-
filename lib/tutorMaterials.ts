import { neon } from "@neondatabase/serverless";
import { isTutorCategoryKey, type TutorCategoryKey } from "@/lib/tutorCategories";

export type TutorMaterial = {
  category: TutorCategoryKey;
  title: string;
  fileUrl: string;
  fileName: string;
  // File size in bytes, for the per-topic size budget. Absent on entries
  // registered before sizes were recorded.
  size?: number;
};

export const MAX_TUTOR_MATERIALS_PER_CATEGORY = 5;

// Uploaded files live on Vercel Blob; refuse anything else so the tutor
// route never fetches an arbitrary URL on the admin's say-so.
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

const SETTINGS_KEY = "tutor-materials";

// Gemini's inline request limit is 20MB including base64 overhead (~33%),
// so the PDFs sent with each question (one category's worth) must stay well
// under that in total.
export const MAX_TOTAL_PDF_MB = 12;
const MAX_TOTAL_PDF_BYTES = MAX_TOTAL_PDF_MB * 1024 * 1024;

export function isTutorMaterialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(BLOB_HOST_SUFFIX) &&
      url.pathname.toLowerCase().endsWith(".pdf")
    );
  } catch {
    return false;
  }
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL(또는 POSTGRES_URL) 환경변수가 설정되지 않았습니다.");
  }
  return url;
}

function getSql() {
  return neon(requireDatabaseUrl());
}

export async function getTutorMaterials(): Promise<TutorMaterial[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: { materials?: TutorMaterial[] } }[];
  // Entries saved before categories existed have none and can't be shown
  // under any topic.
  return (rows[0]?.value?.materials ?? []).filter((m) => isTutorCategoryKey(m.category));
}

export async function updateTutorMaterials(materials: TutorMaterial[]): Promise<TutorMaterial[]> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify({ materials })}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: { materials: TutorMaterial[] } }[];
  return rows[0].value.materials;
}

export type LoadedTutorMaterial = { title: string; base64: string };

// Blob URLs are immutable (random suffix per upload), so a downloaded PDF
// never goes stale; replacing a file produces a new URL.
const pdfCache = new Map<string, { base64: string; bytes: number }>();

async function loadPdf(fileUrl: string): Promise<{ base64: string; bytes: number } | null> {
  const cached = pdfCache.get(fileUrl);
  if (cached) return cached;

  const response = await fetch(fileUrl);
  if (!response.ok) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  const loaded = { base64: buffer.toString("base64"), bytes: buffer.byteLength };
  pdfCache.set(fileUrl, loaded);
  return loaded;
}

/**
 * Downloads one category's registered PDFs for inclusion in a Gemini
 * request. A file that fails to download or would push the total over the
 * size budget is skipped rather than failing the student's question.
 */
export async function loadTutorMaterials(
  category: TutorCategoryKey
): Promise<LoadedTutorMaterial[]> {
  const materials = (await getTutorMaterials()).filter((m) => m.category === category);
  const loaded: LoadedTutorMaterial[] = [];
  let totalBytes = 0;

  for (const material of materials) {
    if (!isTutorMaterialUrl(material.fileUrl)) continue;
    try {
      const pdf = await loadPdf(material.fileUrl);
      if (!pdf) {
        console.error("튜터 참고자료 다운로드 실패:", material.title);
        continue;
      }
      if (totalBytes + pdf.bytes > MAX_TOTAL_PDF_BYTES) {
        console.error("튜터 참고자료 용량 초과로 제외:", material.title);
        continue;
      }
      totalBytes += pdf.bytes;
      loaded.push({ title: material.title, base64: pdf.base64 });
    } catch (error) {
      console.error("튜터 참고자료 다운로드 실패:", material.title, error);
    }
  }

  return loaded;
}
