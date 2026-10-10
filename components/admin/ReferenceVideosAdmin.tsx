"use client";

import { useState } from "react";
import { parseYouTubeId, type ReferenceVideosSettings } from "@/lib/referenceVideos";

// What the form edits: the video's ID is worked out from the link on save.
type Row = { title: string; url: string; desc: string };

function emptyRow(): Row {
  return { title: "", url: "", desc: "" };
}

function toRows(settings: ReferenceVideosSettings): Row[] {
  return settings.items.length > 0
    ? settings.items.map(({ title, url, desc }) => ({ title, url, desc }))
    : [emptyRow()];
}

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500";

export default function ReferenceVideosAdmin({ initialSettings }: { initialSettings: ReferenceVideosSettings }) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initialSettings));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }
  function remove(idx: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyRow()]));
  }
  function move(idx: number, by: number) {
    setRows((prev) => {
      const to = idx + by;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rows }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setRows(toRows(data.settings));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">실습 참고 영상 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-xs leading-relaxed text-slate-500">
          유튜브에서 영상의 &lsquo;공유&rsquo;를 눌러 나오는 주소나 주소창의 주소를 그대로 붙여 넣으면
          됩니다. 영상은 학생 화면의 실습 참고 영상에 이 순서대로 나옵니다.
        </p>

        {rows.map((row, idx) => {
          const videoId = row.url.trim() ? parseYouTubeId(row.url) : null;
          return (
            <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">영상 {idx + 1}</span>
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
                    disabled={idx === rows.length - 1}
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={row.title}
                    onChange={(e) => update(idx, { title: e.target.value })}
                    placeholder="영상 제목"
                    className={inputClass}
                  />
                  <input
                    value={row.url}
                    onChange={(e) => update(idx, { url: e.target.value })}
                    placeholder="유튜브 링크 (예: https://youtu.be/...)"
                    className={inputClass}
                  />
                  {row.url.trim() && !videoId && (
                    <p className="text-xs text-rose-600">유튜브 링크가 아닙니다. 주소를 다시 확인해주세요.</p>
                  )}
                  <textarea
                    value={row.desc}
                    onChange={(e) => update(idx, { desc: e.target.value })}
                    rows={2}
                    placeholder="설명 (선택)"
                    className={inputClass}
                  />
                </div>
                {videoId && (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="영상 미리보기"
                    className="aspect-video w-full rounded-lg object-cover sm:w-44 sm:self-start"
                  />
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          + 영상 추가
        </button>

        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 실습 참고 영상 페이지에 바로 반영됩니다.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "실습 참고 영상 저장"}
        </button>
      </div>
    </div>
  );
}
