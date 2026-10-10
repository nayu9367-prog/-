"use client";

import { useState, type ChangeEvent } from "react";
import {
  RESOURCE_COLOR_KEYS,
  RESOURCE_ICONS,
  type ResourceColorKey,
  type ResourceTemplate,
  type ResourcesSettings,
} from "@/lib/resourcesSettings";

const COLOR_LABELS: Record<ResourceColorKey, string> = {
  emerald: "초록",
  sky: "하늘",
  teal: "청록",
  amber: "주황",
};

function emptyTemplate(): ResourceTemplate {
  return { icon: "fa-solid fa-file", title: "", desc: "", colorKey: "emerald" };
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
          카드 색: {COLOR_LABELS[c]}
        </option>
      ))}
    </select>
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
  const [uploadNotice, setUploadNotice] = useState<string>("");

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
    setUploadNotice("");
    setUploadingIdx(idx);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "파일 업로드에 실패했습니다.");
      update(idx, { fileUrl: data.url, fileName: data.fileName });
      setUploadNotice(
        "✅ 파일이 업로드되었습니다. 아직 저장된 건 아니에요 — 페이지 하단의 '실습 서식 저장' 버튼을 꼭 눌러주세요!"
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploadingIdx(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">실습 서식 (학생이 내려받을 파일)</label>
      {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
      {uploadNotice && (
        <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {uploadNotice}
        </p>
      )}
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
            <div className="flex items-center gap-2">
              <i className={`${t.icon} w-6 text-center text-xl text-slate-500`} />
              <select
                value={t.icon}
                onChange={(e) => update(idx, { icon: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              >
                {!RESOURCE_ICONS.some((icon) => icon.value === t.icon) && (
                  <option value={t.icon}>카드 그림: 현재 그림 유지</option>
                )}
                {RESOURCE_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    카드 그림: {icon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            value={t.desc}
            onChange={(e) => update(idx, { desc: e.target.value })}
            placeholder="한 줄 설명 (선택)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-3">
            <span className="text-xs font-medium text-slate-600">첨부 파일</span>
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
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp,.hwpx,.txt,.png,.jpg,.jpeg,.gif,.webp"
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
      <h2 className="text-lg font-semibold text-slate-800">실습 서식 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 실습 서식 페이지에 바로 반영됩니다.
          </p>
        )}

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
          {busy ? "저장 중..." : "실습 서식 저장"}
        </button>
      </div>
    </div>
  );
}
