"use client";

import { useState, type ChangeEvent } from "react";
import {
  DEFAULT_SAFETY_ICON,
  SAFETY_BLOCKS,
  SAFETY_ICONS,
  SAFETY_TABS,
  type SafetyBlockKey,
  type SafetyItem,
  type SafetySettings,
} from "@/lib/safetySettings";

const MAX_UPLOAD_MB = 20;

function emptyItem(): SafetyItem {
  return { icon: DEFAULT_SAFETY_ICON, title: "", desc: "" };
}

function ItemsEditor({
  items,
  onChange,
}: {
  items: SafetyItem[];
  onChange: (items: SafetyItem[]) => void;
}) {
  function update(idx: number, patch: Partial<SafetyItem>) {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function move(idx: number, by: number) {
    const to = idx + by;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">항목 {idx + 1}</span>
            <span className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
              >
                위로
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
              >
                아래로
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              >
                삭제
              </button>
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={item.title}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="제목"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-2">
              <i className={`${item.icon} w-6 text-center text-xl text-slate-500`} />
              <select
                value={item.icon}
                onChange={(e) => update(idx, { icon: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              >
                {SAFETY_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    카드 그림: {icon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            value={item.desc}
            onChange={(e) => update(idx, { desc: e.target.value })}
            rows={3}
            placeholder="설명 (줄을 바꾸면 화면에서도 줄이 바뀝니다)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, emptyItem()])}
        className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        + 항목 추가
      </button>
    </div>
  );
}

export default function SafetyAdmin({ initialSettings }: { initialSettings: SafetySettings }) {
  const [form, setForm] = useState<SafetySettings>(initialSettings);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  function setBlock(key: SafetyBlockKey, items: SafetyItem[]) {
    setForm((f) => ({ ...f, blocks: { ...f.blocks, [key]: items } }));
  }

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setUploadError(`파일 크기는 ${MAX_UPLOAD_MB}MB 이하만 업로드할 수 있습니다.`);
      return;
    }

    setUploadError("");
    setUploadNotice("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "파일 업로드에 실패했습니다.");
      setForm((f) => ({ ...f, fileUrl: data.url, fileName: data.fileName }));
      setUploadNotice(
        "✅ 파일이 업로드되었습니다. 아직 저장된 건 아니에요 — 페이지 하단의 '안내 저장' 버튼을 꼭 눌러주세요!"
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/safety", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setForm(data.settings);
      setUploadNotice("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">안전·인권·감염관리 안내 관리</h2>
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {SAFETY_TABS.map((tab, tabIdx) => (
          <section key={tab.key} className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
              <i className={`${tab.icon} text-emerald-600`} /> {tabIdx + 1}. {tab.label}
            </h3>
            {SAFETY_BLOCKS.filter((block) => block.tab === tab.key).map((block) => (
              <div key={block.key} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">{block.heading}</label>
                {"image" in block && (
                  <p className="text-xs text-slate-500">
                    이 묶음 위에는 수업 자료의 그림이 함께 나옵니다. 그림은 이 화면에서 바꿀 수 없습니다.
                  </p>
                )}
                <ItemsEditor
                  items={form.blocks[block.key] ?? []}
                  onChange={(items) => setBlock(block.key, items)}
                />
              </div>
            ))}
          </section>
        ))}

        <section className="flex flex-col gap-2">
          <h3 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
            <i className="fa-solid fa-paperclip text-emerald-600" /> 내려받기용 자료 (선택)
          </h3>
          <p className="text-xs text-slate-500">
            PPT 같은 원본 자료를 올리면 학생 화면 맨 아래에 내려받기 버튼이 생깁니다.
          </p>
          {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
          {uploadNotice && (
            <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {uploadNotice}
            </p>
          )}
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-3">
            {form.fileUrl ? (
              <div className="flex items-center justify-between gap-2 text-xs">
                <a
                  href={form.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-700 font-medium hover:underline truncate"
                >
                  <i className="fa-solid fa-paperclip" /> {form.fileName || "첨부된 파일"}
                </a>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, fileUrl: undefined, fileName: undefined }))}
                  className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  파일 제거
                </button>
              </div>
            ) : (
              <label className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer">
                {uploading ? "업로드 중..." : "+ 파일 선택"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp,.hwpx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>
        </section>

        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 안전·인권·감염관리 페이지에 바로 반영됩니다.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "안내 저장"}
        </button>
      </div>
    </div>
  );
}
