"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { CommunityPost } from "@/lib/community";

const CATEGORY_STYLE: Record<string, string> = {
  "실습 후기": "bg-emerald-100 text-emerald-800",
  질문: "bg-amber-100 text-amber-800",
  "팁 공유": "bg-sky-100 text-sky-800",
};

export default function CommunityAdmin({ initialPosts }: { initialPosts: CommunityPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/community/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">커뮤니티 게시글 관리</h2>
        <p className="text-sm text-slate-500 mt-1">
          학생들이 익명으로 작성한 실습 후기·질문·팁을 확인하고, 부적절한 글은 삭제할 수 있습니다.
        </p>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          아직 등록된 게시글이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        CATEGORY_STYLE[post.category] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {post.category}
                    </span>
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={busy}
                    className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{post.body}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>작성자: {post.authorName}</span>
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
