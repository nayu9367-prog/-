"use client";

import { useState } from "react";
import type { ReferenceVideo } from "@/lib/referenceVideos";

export default function ReferenceVideos({ videos }: { videos: ReferenceVideo[] }) {
  // The player loads only for the video that was pressed: a page of live
  // players would each pull in YouTube's scripts up front.
  const [playing, setPlaying] = useState<number | null>(null);

  if (videos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        아직 등록된 영상이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {videos.map((video, idx) => (
        <div
          key={`${idx}-${video.videoId}`}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative aspect-video bg-slate-900">
            {playing === idx ? (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(idx)}
                aria-label={`${video.title} 재생`}
                className="group absolute inset-0 flex items-center justify-center"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-xl text-white shadow-lg transition-transform group-hover:scale-110">
                  <i className="fa-solid fa-play ml-1" />
                </span>
              </button>
            )}
          </div>
          <div className="space-y-1.5 p-4">
            <h3 className="text-sm font-bold leading-snug text-slate-800 md:text-base">{video.title}</h3>
            {video.desc && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-500">{video.desc}</p>
            )}
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              <i className="fa-brands fa-youtube" /> 유튜브에서 보기
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
