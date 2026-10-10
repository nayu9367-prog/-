"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { formatDate } from "@/lib/format";
import { MAX_HANDOVER_FILE_MB, type HandoverFile } from "@/lib/handoverData";

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500";

export default function HandoverBoard({
  initialFiles,
  institutions,
  admin = false,
}: {
  initialFiles: HandoverFile[];
  // Names to choose from; with none registered the student types the name.
  institutions: string[];
  // The admin view deletes files instead of uploading them.
  admin?: boolean;
}) {
  const [files, setFiles] = useState(initialFiles);
  const [open, setOpen] = useState(false);
  const [institution, setInstitution] = useState(institutions[0] ?? "");
  const [period, setPeriod] = useState("");
  const [picked, setPicked] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // One group per registered institution, then any a file names that has
  // since been renamed or removed.
  const names = [...new Set([...institutions, ...files.map((f) => f.institution)])];

  function openFormFor(name: string) {
    setInstitution(name);
    setOpen(true);
    setError("");
    // The form sits above the list; it isn't on screen until the next paint.
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: "center" }));
  }

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    if (file && !file.name.toLowerCase().endsWith(".pdf")) {
      event.target.value = "";
      setPicked(null);
      setError("PDF 파일만 올릴 수 있습니다.");
      return;
    }
    if (file && file.size > MAX_HANDOVER_FILE_MB * 1024 * 1024) {
      event.target.value = "";
      setPicked(null);
      setError(`파일 크기는 ${MAX_HANDOVER_FILE_MB}MB 이하만 올릴 수 있습니다.`);
      return;
    }
    setPicked(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked) {
      setError("PDF 파일을 선택해주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("institution", institution);
      body.append("period", period);
      body.append("file", picked);
      const response = await fetch("/api/handover", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "업로드에 실패했습니다.");
      setFiles((prev) => [data.file, ...prev]);
      setPicked(null);
      setPeriod("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(file: HandoverFile) {
    if (!window.confirm(`"${file.fileName}" 파일을 삭제하시겠습니까? 되돌릴 수 없습니다.`)) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/handover/${file.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {!admin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2.5 rounded-xl font-bold shadow transition-all"
          >
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-file-arrow-up"} mr-1`} />{" "}
            {open ? "올리기 취소" : "인계 자료 올리기"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {open && !admin && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              실습기관
              {institutions.length > 0 ? (
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`${inputClass} font-normal`}
                >
                  {institutions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  placeholder="예: 서구보건소"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`${inputClass} font-normal`}
                />
              )}
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              실습 시기·조
              <input
                required
                maxLength={60}
                placeholder="예: 2학기 1조"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={`${inputClass} font-normal`}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            인계 자료 (PDF)
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePick}
              className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm font-normal text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
          </label>
          <p className="text-xs leading-relaxed text-slate-500">
            PDF 파일만 올릴 수 있습니다 ({MAX_HANDOVER_FILE_MB}MB 이하). 올린 자료는 다른 학생들도 볼 수
            있으니, 대상자나 직원의 이름·연락처 같은 개인정보가 들어 있지 않은지 확인해 주세요.
          </p>
          <button
            type="submit"
            disabled={busy || !picked}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "올리는 중..." : "올리기"}
          </button>
        </form>
      )}

      {names.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 올라온 인계 자료가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {names.map((name) => {
            const group = files.filter((f) => f.institution === name);
            return (
              <section
                key={name}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h4 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
                    <i className="fa-solid fa-hospital shrink-0 text-emerald-600" />
                    <span className="truncate">{name}</span>
                    <span className="shrink-0 text-xs font-semibold text-slate-400">{group.length}건</span>
                  </h4>
                  {!admin && (
                    <button
                      type="button"
                      onClick={() => openFormFor(name)}
                      className="shrink-0 rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      + 올리기
                    </button>
                  )}
                </div>
                {group.length === 0 ? (
                  <p className="py-2 text-center text-sm text-slate-400">아직 올라온 자료가 없습니다.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {group.map((file) => (
                      <li key={file.id} className="flex items-center gap-2">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-emerald-50"
                        >
                          <i className="fa-solid fa-file-pdf shrink-0 text-xl text-rose-500" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-slate-800">
                              {file.period}
                            </span>
                            <span className="block truncate text-xs text-slate-500">{file.fileName}</span>
                          </span>
                          <span className="shrink-0 text-xs text-slate-400">{formatDate(file.createdAt)}</span>
                        </a>
                        {admin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(file)}
                            disabled={busy}
                            className="shrink-0 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            삭제
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
