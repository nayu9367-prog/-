"use client";

import { useState, type ChangeEvent } from "react";
import {
  RESOURCE_COLOR_KEYS,
  type OmahaDomain,
  type ResourceColorKey,
  type ResourceTemplate,
  type ResourcesSettings,
} from "@/lib/resourcesSettings";

function emptyDomain(): OmahaDomain {
  return { title: "", desc: "", example: "", colorKey: "emerald" };
}

function emptyTemplate(): ResourceTemplate {
  return { icon: "fa-solid fa-file", title: "", desc: "", text: "", colorKey: "emerald" };
}

const MAX_UPLOAD_MB = 20;

function ColorSelect({
  value,
  onChange,
}: {
  value: ResourceColorKey;
  onChange: (value: ResourceColorKey) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ResourceColorKey)}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
    >
      {RESOURCE_COLOR_KEYS.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function OmahaDomainsEditor({
  domains,
  onChange,
}: {
  domains: OmahaDomain[];
  onChange: (domains: OmahaDomain[]) => void;
}) {
  function update(idx: number, patch: Partial<OmahaDomain>) {
    onChange(domains.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }
  function remove(idx: number) {
    onChange(domains.length > 1 ? domains.filter((_, i) => i !== idx) : [emptyDomain()]);
  }
  function add() {
    onChange([...domains, emptyDomain()]);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">OMAHA 영역 안내</label>
      {domains.map((domain, idx) => (
        <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">영역 {idx + 1}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              삭제
            </button>
          </div>
          <input
            value={domain.title}
            onChange={(e) => update(idx, { title: e.target.value })}
            placeholder="영역 제목 (예: 1. 환경 영역 (Environmental))"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <textarea
            value={domain.desc}
            onChange={(e) => update(idx, { desc: e.target.value })}
            rows={2}
            placeholder="영역 설명"
            className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={domain.example}
              onChange={(e) => update(idx, { example: e.target.value })}
              placeholder="예시 (예: 예: 불결한 주거환경, 낙상 위험 환경)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <ColorSelect value={domain.colorKey} onChange={(colorKey) => update(idx, { colorKey })} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        + 영역 추가
      </button>
    </div>
  );
}

function TemplatesEditor({
  templates,
  onChange,
}: {
  templates: ResourceTemplate[];
  onChange: (templates: ResourceTemplate[]) => void;
}) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  function update(idx: number, patch: Partial<ResourceTemplate>) {
    onChange(templates.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }
  function remove(idx: number) {
    onChange(templates.length > 1 ? templates.filter((_, i) => i !== idx) : [emptyTemplate()]);
  }
  function add() {
    onChange([...templates, emptyTemplate()]);
  }

  async function handleFileSelect(idx: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setUploadError(`파일 크기는 ${MAX_UPLOAD_MB}MB 이하만 업로드할 수 있습니다.`);
      return;
    }

    setUploadError("");
    setUploadingIdx(idx);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "파일 업로드에 실패했습니다.");
      update(idx, { fileUrl: data.url, fileName: data.fileName });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploadingIdx(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">실습 서식 (텍스트 복사 또는 파일 첨부)</label>
      {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
      {templates.map((t, idx) => (
        <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">서식 {idx + 1}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              삭제
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={t.title}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="서식 제목"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <input
              value={t.icon}
              onChange={(e) => update(idx, { icon: e.target.value })}
              placeholder="아이콘 (예: fa-solid fa-file-contract)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
          <input
            value={t.desc}
            onChange={(e) => update(idx, { desc: e.target.value })}
            placeholder="한 줄 설명"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <textarea
            value={t.text ?? ""}
            onChange={(e) => update(idx, { text: e.target.value })}
            rows={4}
            placeholder="복사될 양식 텍스트 (선택 — 파일만 첨부해도 됩니다)"
            className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 font-mono"
          />

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-3">
            <span className="text-xs font-medium text-slate-600">첨부 파일 (선택)</span>
            {t.fileUrl ? (
              <div className="flex items-center justify-between gap-2 text-xs">
                <a
                  href={t.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-700 font-medium hover:underline truncate"
                >
                  <i className="fa-solid fa-paperclip" /> {t.fileName || "첨부된 파일"}
                </a>
                <button
                  type="button"
                  onClick={() => update(idx, { fileUrl: undefined, fileName: undefined })}
                  className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  파일 제거
                </button>
              </div>
            ) : (
              <label className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer">
                {uploadingIdx === idx ? "업로드 중..." : "+ 파일 선택"}
                <input
                  type="file"
                  className="hidden"
                  disabled={uploadingIdx === idx}
                  onChange={(e) => handleFileSelect(idx, e)}
                />
              </label>
            )}
          </div>

          <ColorSelect value={t.colorKey} onChange={(colorKey) => update(idx, { colorKey })} />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        + 서식 추가
      </button>
    </div>
  );
}

export default function ResourcesAdmin({ initialSettings }: { initialSettings: ResourcesSettings }) {
  const [form, setForm] = useState<ResourcesSettings>(initialSettings);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setForm(data.settings);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">자료실 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 자료실 페이지에 바로 반영됩니다.
          </p>
        )}

        <OmahaDomainsEditor
          domains={form.omahaDomains}
          onChange={(omahaDomains) => setForm((f) => ({ ...f, omahaDomains }))}
        />
        <TemplatesEditor
          templates={form.templates}
          onChange={(templates) => setForm((f) => ({ ...f, templates }))}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "자료실 저장"}
        </button>
      </div>
    </div>
  );
}
