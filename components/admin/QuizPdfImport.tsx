"use client";

import { useState, type ChangeEvent } from "react";
import type { QuizQuestion } from "@/lib/quizData";
import type { QuizQuestionInput } from "@/lib/quiz";
import { MAX_IMPORT_PDF_MB } from "@/lib/quizImport";

type Candidate = QuizQuestionInput & { selected: boolean; duplicate: boolean };

export default function QuizPdfImport({
  existingQuestions,
  onImported,
}: {
  existingQuestions: QuizQuestion[];
  onImported: (questions: QuizQuestion[]) => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("PDF 파일만 올릴 수 있습니다. 한글·Word 파일은 PDF로 저장한 뒤 올려주세요.");
      return;
    }
    if (file.size > MAX_IMPORT_PDF_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_IMPORT_PDF_MB}MB 이하만 올릴 수 있습니다.`);
      return;
    }

    setError("");
    setNotice("");
    setCandidates(null);
    setReading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/quiz/import", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "PDF를 읽지 못했습니다.");

      const existing = new Set(existingQuestions.map((q) => q.question.trim()));
      const found: QuizQuestionInput[] = data.questions ?? [];
      if (found.length === 0) {
        throw new Error(
          "PDF에서 정답과 해설이 함께 있는 객관식 문제를 찾지 못했습니다. 글자가 선택되는 PDF인지 확인해주세요."
        );
      }
      setSkippedCount(data.skippedCount ?? 0);
      setCandidates(
        found.map((q) => {
          const duplicate = existing.has(q.question.trim());
          return { ...q, duplicate, selected: !duplicate };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF를 읽지 못했습니다.");
    } finally {
      setReading(false);
    }
  }

  function toggle(idx: number) {
    setCandidates((prev) => prev && prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c)));
  }

  function setAll(selected: boolean) {
    setCandidates((prev) => prev && prev.map((c) => ({ ...c, selected })));
  }

  async function handleSave() {
    if (!candidates) return;
    const chosen = candidates.filter((c) => c.selected);
    if (chosen.length === 0) return;

    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/quiz/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: chosen.map(({ question, options, answer, explanation }) => ({
            question,
            options,
            answer,
            explanation,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      onImported(data.questions);
      setCandidates(null);
      setNotice(`${data.questions.length}문제를 문제 은행에 등록했습니다. 아래 목록에서 수정하거나 삭제할 수 있습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = candidates?.filter((c) => c.selected).length ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">PDF에서 문제 가져오기</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          문제·보기·정답·해설이 들어 있는 PDF를 올리면 AI가 문제를 읽어 아래에 보여줍니다.
          내용을 확인한 뒤 등록 버튼을 눌러야 문제 은행에 저장됩니다.
        </p>
        <ul className="text-xs text-slate-500 leading-relaxed list-disc pl-5">
          <li>PDF만 올릴 수 있습니다. ({MAX_IMPORT_PDF_MB}MB 이하)</li>
          <li>문제가 많으면 읽는 데 1~2분 걸릴 수 있습니다.</li>
          <li>AI가 잘못 읽을 수 있으니, 등록 전에 정답 표시(✓)를 꼭 확인해주세요.</li>
        </ul>

        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {notice && <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</p>}

        <label
          className={`self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 ${
            reading || saving ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          {reading ? "AI가 PDF를 읽는 중... (1~2분)" : "+ 문제 PDF 선택"}
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={reading || saving}
            onChange={handleFileSelect}
          />
        </label>

        {candidates && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">
                {candidates.length}문제를 읽었습니다. ({selectedCount}문제 선택됨)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAll(true)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  전체 선택
                </button>
                <button
                  type="button"
                  onClick={() => setAll(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  전체 해제
                </button>
              </div>
            </div>
            {skippedCount > 0 && (
              <p className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700">
                {skippedCount}문제는 PDF에서 정답이나 해설을 찾지 못해 제외했습니다. 필요하면 아래
                &lsquo;새 퀴즈 문제 등록&rsquo;에서 직접 입력해주세요.
              </p>
            )}

            <ul className="flex flex-col gap-2">
              {candidates.map((c, idx) => (
                <li
                  key={idx}
                  className={`rounded-xl border p-3 ${
                    c.selected ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={c.selected}
                      onChange={() => toggle(idx)}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {c.question}
                        {c.duplicate && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            이미 등록된 문제
                          </span>
                        )}
                      </span>
                      <ul className="space-y-0.5 text-xs text-slate-600">
                        {c.options.map((opt, optIdx) => (
                          <li key={optIdx} className={optIdx === c.answer ? "font-bold text-emerald-700" : ""}>
                            {optIdx + 1}. {opt} {optIdx === c.answer && "✓"}
                          </li>
                        ))}
                      </ul>
                      <p className="rounded-lg border border-slate-100 bg-white p-2 text-xs text-slate-500">
                        💡 {c.explanation}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || selectedCount === 0}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "등록 중..." : `선택한 ${selectedCount}문제 등록`}
              </button>
              <button
                type="button"
                onClick={() => setCandidates(null)}
                disabled={saving}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
