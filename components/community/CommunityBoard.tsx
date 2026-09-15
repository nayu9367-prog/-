"use client";

import { useState, type FormEvent } from "react";
import { formatDate } from "@/lib/format";
import type { CommunityPost } from "@/lib/community";

const CATEGORIES = ["실습 후기", "질문", "팁 공유"];

const CATEGORY_STYLE: Record<string, string> = {
  "실습 후기": "bg-emerald-100 text-emerald-800",
  질문: "bg-amber-100 text-amber-800",
  "팁 공유": "bg-sky-100 text-sky-800",
};

export default function CommunityBoard({ initialPosts }: { initialPosts: CommunityPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, body, authorName }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setPosts((prev) => [data.post, ...prev]);
      setTitle("");
      setBody("");
      setAuthorName("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow transition-all"
        >
          <i className="fa-solid fa-pen mr-1" /> {open ? "작성 취소" : "질문 / 후기 작성"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="작성자 (예: 3학년 민수)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
          <input
            required
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <textarea
            required
            rows={4}
            placeholder="내용을 입력해주세요."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "등록 중..." : "등록"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {posts.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">아직 게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    CATEGORY_STYLE[post.category] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {post.category}
                </span>
                <h4 className="font-bold text-slate-800 text-sm">{post.title}</h4>
              </div>
              <p className="text-xs text-slate-500 whitespace-pre-wrap">{post.body}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>작성자: {post.authorName}</span>
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
