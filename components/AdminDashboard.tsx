"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatDate } from "@/lib/format";
import type { Announcement } from "@/lib/data";

type Props = {
  initialAnnouncements: Announcement[];
};

type FormState = {
  title: string;
  content: string;
};

const emptyForm: FormState = { title: "", content: "" };

export default function AdminDashboard({ initialAnnouncements }: Props) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function sortByCreatedAtDesc(list: Announcement[]): Announcement[] {
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
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
    setEditForm({ title: announcement.title, content: announcement.content });
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">관리자 페이지</h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          로그아웃
        </button>
      </header>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-neutral-800">새 공지사항 작성</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <input
            required
            placeholder="제목"
            value={createForm.title}
            onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
          />
          <textarea
            required
            rows={4}
            placeholder="내용"
            value={createForm.content}
            onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
            className="resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            등록
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          공지사항 목록 ({announcements.length})
        </h2>
        {announcements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              >
                {editingId === a.id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
                    />
                    <textarea
                      rows={4}
                      value={editForm.content}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, content: e.target.value }))
                      }
                      className="resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(a.id)}
                        disabled={busy}
                        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-neutral-900">{a.title}</h3>
                      <time dateTime={a.createdAt} className="text-xs text-neutral-400">
                        {formatDate(a.createdAt)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-neutral-600">
                      {a.content}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => startEdit(a)}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={busy}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
    </main>
  );
}
