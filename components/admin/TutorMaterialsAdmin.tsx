"use client";

import { useState, type ChangeEvent } from "react";
import { MAX_TUTOR_MATERIALS_PER_CATEGORY, type TutorMaterial } from "@/lib/tutorMaterials";
import { TUTOR_CATEGORIES, type TutorCategoryKey } from "@/lib/tutorCategories";

// A category's PDFs are all sent to the AI together with every question
// asked under it, so the combined size is capped (see MAX_TOTAL_PDF_BYTES in
// lib/tutorMaterials).
const MAX_UPLOAD_MB = 10;

function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").slice(0, 100);
}

export default function TutorMaterialsAdmin({
  initialMaterials,
}: {
  initialMaterials: TutorMaterial[];
}) {
  const [materials, setMaterials] = useState<TutorMaterial[]>(initialMaterials);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadingCategory, setUploadingCategory] = useState<TutorCategoryKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(next: TutorMaterial[], successMessage: string) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/settings/tutor-materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setMaterials(data.materials);
      setNotice(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFileSelect(
    category: TutorCategoryKey,
    categoryLabel: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("PDF 파일만 등록할 수 있습니다. 한글·Word·PPT 파일은 PDF로 저장한 뒤 올려주세요.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_UPLOAD_MB}MB 이하만 등록할 수 있습니다.`);
      return;
    }

    setError("");
    setNotice("");
    setUploadingCategory(category);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "파일 업로드에 실패했습니다.");
      await save(
        [
          ...materials,
          { category, title: titleFromFileName(file.name), fileUrl: data.url, fileName: data.fileName },
        ],
        `「${categoryLabel}」에 자료가 등록되었습니다. 학생이 이 주제를 고르면 AI 튜터가 이 자료를 참고해 답변합니다.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploadingCategory(null);
    }
  }

  function updateTitle(fileUrl: string, title: string) {
    setMaterials((prev) => prev.map((m) => (m.fileUrl === fileUrl ? { ...m, title } : m)));
  }

  async function handleRemove(fileUrl: string) {
    if (!window.confirm("이 참고자료를 삭제하시겠습니까? AI 튜터가 더 이상 이 자료를 참고하지 않습니다.")) return;
    await save(
      materials.filter((m) => m.fileUrl !== fileUrl),
      "자료가 삭제되었습니다."
    );
  }

  const uploading = uploadingCategory !== null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">AI 튜터 참고자료</h2>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          학생은 보건교육 튜터에서 아래 네 가지 주제 중 하나를 고릅니다. 주제마다 등록한 PDF를 AI
          튜터가 읽고 답합니다. 자료에 있는 내용은 자료를 근거로 답하고, 자료에 없는 내용은 그렇다고
          밝힌 뒤 일반 지식으로 답합니다.
        </p>
        <ul className="text-xs text-slate-500 leading-relaxed list-disc pl-5">
          <li>
            PDF만 등록할 수 있습니다. (파일당 {MAX_UPLOAD_MB}MB 이하, 주제마다 최대{" "}
            {MAX_TUTOR_MATERIALS_PER_CATEGORY}개)
          </li>
          <li>
            한 주제의 자료 전체가 질문마다 함께 전달되므로, 분량이 많을수록 답변이 느려지고 AI
            사용량이 늘어납니다.
          </li>
          <li>학생 개인정보가 담긴 문서는 올리지 마세요.</li>
        </ul>

        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {notice && <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</p>}
      </div>

      {TUTOR_CATEGORIES.map((category) => {
        const items = materials.filter((m) => m.category === category.key);
        const isFull = items.length >= MAX_TUTOR_MATERIALS_PER_CATEGORY;
        return (
          <section
            key={category.key}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="font-bold text-slate-900">
              {category.icon} {category.label}{" "}
              <span className="text-xs font-medium text-slate-400">({items.length}개)</span>
            </h3>

            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                등록된 자료가 없습니다. 이 주제에서는 AI 튜터가 일반 지식만으로 답변합니다.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((m) => (
                  <div
                    key={m.fileUrl}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline truncate"
                      >
                        <i className="fa-solid fa-file-pdf" /> {m.fileName}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemove(m.fileUrl)}
                        disabled={busy}
                        className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={m.title}
                        onChange={(e) => updateTitle(m.fileUrl, e.target.value)}
                        placeholder="자료 이름 (예: 2026-2 지역사회간호학 실습 지침서)"
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => save(materials, "자료 이름이 저장되었습니다.")}
                        disabled={busy || !m.title.trim()}
                        className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        이름 저장
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isFull ? (
              <p className="text-xs text-slate-500">
                주제마다 최대 {MAX_TUTOR_MATERIALS_PER_CATEGORY}개까지 등록할 수 있습니다. 새 자료를
                올리려면 기존 자료를 삭제해주세요.
              </p>
            ) : (
              <label
                className={`self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 ${
                  uploading || busy ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                {uploadingCategory === category.key ? "업로드 중..." : "+ PDF 자료 등록"}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={uploading || busy}
                  onChange={(e) => handleFileSelect(category.key, category.label, e)}
                />
              </label>
            )}
          </section>
        );
      })}
    </div>
  );
}
