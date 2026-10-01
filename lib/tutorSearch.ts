import { extractText, getDocumentProxy } from "unpdf";
import {
  getTutorMaterials,
  isTutorMaterialUrl,
  type TutorMaterial,
} from "@/lib/tutorMaterials";
import type { TutorCategoryKey } from "@/lib/tutorCategories";

// Keyword search over the registered PDFs, used when the AI can't answer
// (its request quota is used up). No AI involved: it finds the passages of
// the professor's materials that best match the words in the question.

export type TutorSource = { title: string; fileUrl: string; page: number };

export type TutorSearchResult = {
  passages: (TutorSource & { text: string })[];
  // Whether any searchable material exists at all (a scanned PDF has no text).
  hasSearchableMaterial: boolean;
};

type Passage = { page: number; text: string };

const MAX_PASSAGES = 3;
const PASSAGE_CHARS = 450;

// Question words that say nothing about the topic being asked about.
const STOPWORDS = new Set([
  "알려줘", "알려주세요", "알려줄래", "설명", "설명해줘", "설명해주세요", "해줘", "해주세요", "주세요",
  "무엇", "무엇인가요", "뭐야", "뭔가요", "뭐예요", "어떻게", "어떤", "왜", "언제", "어디", "누가",
  "대해", "대해서", "대한", "관련", "관해", "있나요", "있어요", "인가요", "인지", "하나요", "되나요",
  "그리고", "또는", "및", "좀", "것", "수", "때", "등", "이", "그", "저",
]);

// Blob URLs are immutable, so extracted text never goes stale. Promises are
// cached so simultaneous questions share one extraction (see pdfCache).
const passageCache = new Map<string, Promise<Passage[]>>();

function splitIntoPassages(pageText: string, page: number): Passage[] {
  const lines = pageText
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const passages: Passage[] = [];
  let current = "";
  for (const line of lines) {
    if (current && current.length + line.length > PASSAGE_CHARS) {
      passages.push({ page, text: current });
      current = "";
    }
    current = current ? `${current}\n${line}` : line;
  }
  if (current) passages.push({ page, text: current });
  return passages;
}

async function extractPassages(fileUrl: string): Promise<Passage[]> {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`PDF 다운로드 실패 (${response.status})`);
  const pdf = await getDocumentProxy(new Uint8Array(await response.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: false });
  return text.flatMap((pageText, idx) => splitIntoPassages(pageText, idx + 1));
}

function loadPassages(fileUrl: string): Promise<Passage[]> {
  let pending = passageCache.get(fileUrl);
  if (!pending) {
    pending = extractPassages(fileUrl).catch((error) => {
      passageCache.delete(fileUrl);
      throw error;
    });
    passageCache.set(fileUrl, pending);
  }
  return pending;
}

function extractKeywords(question: string): string[] {
  const words = question
    .toLowerCase()
    .split(/[^0-9a-z가-힣]+/)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
  return [...new Set(words)];
}

// Korean attaches particles to the end of a word ("보건소의", "보건소는"), so
// a keyword also counts when only its leading part appears in the passage.
// Longer matches count for much more than short ones.
function scorePassage(passageText: string, keywords: string[]): number {
  const haystack = passageText.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    for (let length = keyword.length; length >= 2; length--) {
      if (haystack.includes(keyword.slice(0, length))) {
        score += length * length;
        break;
      }
    }
  }
  return score;
}

export async function searchTutorMaterials(
  question: string,
  category: TutorCategoryKey | null
): Promise<TutorSearchResult> {
  const all = await getTutorMaterials();
  // With no topic chosen there's nothing to narrow by, so search everything.
  const materials: TutorMaterial[] = category ? all.filter((m) => m.category === category) : all;
  const keywords = extractKeywords(question);

  let hasSearchableMaterial = false;
  const scored: { score: number; passage: TutorSource & { text: string } }[] = [];

  for (const material of materials) {
    if (!isTutorMaterialUrl(material.fileUrl)) continue;
    let passages: Passage[];
    try {
      passages = await loadPassages(material.fileUrl);
    } catch (error) {
      console.error("튜터 참고자료 글자 추출 실패:", material.title, error);
      continue;
    }
    if (passages.length > 0) hasSearchableMaterial = true;
    for (const passage of passages) {
      const score = scorePassage(passage.text, keywords);
      if (score > 0) {
        scored.push({
          score,
          passage: {
            title: material.title,
            fileUrl: material.fileUrl,
            page: passage.page,
            text: passage.text,
          },
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return {
    passages: scored.slice(0, MAX_PASSAGES).map((s) => s.passage),
    hasSearchableMaterial,
  };
}
