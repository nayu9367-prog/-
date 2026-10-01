"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { formatDate } from "@/lib/format";
import type { Announcement } from "@/lib/data";

type Props = {
  initialAnnouncements: Announcement[];
};

type FormState = {
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
};

const emptyForm: FormState = { title: "", content: "" };

const MAX_UPLOAD_MB = 20;

function AttachmentField({
  form,
  onChange,
  onError,
}: {
  form: FormState;
  onChange: (patch: Pick<FormState, "fileUrl" | "fileName">) => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      onError(`파일 크기는 ${MAX_UPLOAD_MB}MB 이하만 업로드할 수 있습니다.`);
      return;
    }

    onError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "파일 업로드에 실패했습니다.");
      onChange({ fileUrl: data.url, fileName: data.fileName });
    } catch (err) {
      onError(err instanceof Error ? err.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
      <span className="text-xs font-medium text-slate-600">
        첨부 파일 (선택) — 오리엔테이션 자료 PDF 등
      </span>
      {form.fileUrl ? (
        <div className="flex items-center justify-between gap-2 text-xs">
          <a
            href={form.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 truncate font-medium text-emerald-700 hover:underline"
          >
            <i className="fa-solid fa-paperclip" /> {form.fileName || "첨부파일"}
          </a>
          <button
            type="button"
            onClick={() => onChange({ fileUrl: undefined, fileName: undefined })}
            className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
          >
            파일 제거
          </button>
        </div>
      ) : (
        <label className="cursor-pointer self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
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
  );
}

export default function AdminDashboard({ initialAnnouncements }: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function sortByCreatedAtDesc(list: Announcement[]): Announcement[] {
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setAnnouncements((prev) => sortByCreatedAtDesc([...prev, data.announcement]));
      setCreateForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      fileUrl: announcement.fileUrl,
      fileName: announcement.fileName,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleUpdate(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "수정에 실패했습니다.");
      setAnnouncements((prev) =>
        sortByCreatedAtDesc(prev.map((a) => (a.id === id ? data.announcement : a)))
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 공지사항을 삭제하시겠습니까?")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-slate-500">공지사항을 작성/수정/삭제할 수 있습니다.</p>

      {error && (
        <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">새 공지사항 작성</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <input
            required
            placeholder="제목"
            value={createForm.title}
            onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <textarea
            required
            rows={4}
            placeholder="내용"
            value={createForm.content}
            onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
            className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <AttachmentField
            form={createForm}
            onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
            onError={setError}
          />
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            등록
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">
          공지사항 목록 ({announcements.length})
        </h2>
        {announcements.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {editingId === a.id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                    <textarea
                      rows={4}
                      value={editForm.content}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, content: e.target.value }))
                      }
                      className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                    <AttachmentField
                      form={editForm}
                      onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
                      onError={setError}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(a.id)}
                        disabled={busy}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <time dateTime={a.createdAt} className="text-xs text-slate-400">
                        {formatDate(a.createdAt)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-600">
                      {a.content}
                    </p>
                    {a.fileUrl && (
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 self-start text-xs font-medium text-emerald-700 hover:underline"
                      >
                        <i className="fa-solid fa-paperclip" /> {a.fileName || "첨부파일"}
                      </a>
                    )}
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => startEdit(a)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={busy}
                        className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
