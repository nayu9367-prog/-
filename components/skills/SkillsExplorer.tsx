"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Skill } from "@/lib/skillsData";
import {
  WATCH_COMPLETE_RATIO,
  loadWatchState,
  saveWatchState,
  watchKey,
  watchPercent,
  type WatchEntry,
  type WatchState,
} from "@/lib/skillWatch";

const VIMEO_ORIGIN = "https://player.vimeo.com";
const YOUTUBE_ORIGIN = "https://www.youtube.com";

function getEmbedUrl(skill: Skill, autoplay: boolean): string {
  if (skill.provider === "vimeo") {
    return `https://player.vimeo.com/video/${skill.videoId}${autoplay ? "?autoplay=1" : ""}`;
  }
  // enablejsapi lets the player report how far it has played.
  return `https://www.youtube.com/embed/${skill.videoId}?enablejsapi=1${autoplay ? "&autoplay=1" : ""}`;
}

// Asks a player to start reporting its position to this page.
function subscribe(frame: HTMLIFrameElement, skill: Skill) {
  const target = frame.contentWindow;
  if (!target) return;
  if (skill.provider === "vimeo") {
    target.postMessage(JSON.stringify({ method: "addEventListener", value: "timeupdate" }), VIMEO_ORIGIN);
  } else {
    target.postMessage(JSON.stringify({ event: "listening", id: skill.id, channel: "widget" }), YOUTUBE_ORIGIN);
  }
}

function WatchStatus({ entry, dark = false }: { entry: WatchEntry | undefined; dark?: boolean }) {
  const percent = watchPercent(entry);
  if (percent >= 100) {
    return (
      <span className={`font-bold ${dark ? "text-emerald-300" : "text-emerald-600"}`}>
        <i className="fa-solid fa-circle-check" /> 시청 완료
      </span>
    );
  }
  return (
    <span className={`font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>
      <i className="fa-regular fa-circle-play" /> 시청 {percent}%
    </span>
  );
}

function getThumbnailUrl(skill: Skill): string | null {
  if (skill.provider === "youtube") {
    return `https://img.youtube.com/vi/${skill.videoId}/hqdefault.jpg`;
  }
  return null;
}

export default function SkillsExplorer({ skills }: { skills: Skill[] }) {
  const [activeSkill, setActiveSkill] = useState<Skill | null>(skills[0] ?? null);
  const [modalOpen, setModalOpen] = useState(false);

  const featured = skills[0];

  // What the players have reported so far. The ref is the running total;
  // the state follows it only when the shown percentage changes.
  const [watch, setWatch] = useState<WatchState>({});
  const watchRef = useRef<WatchState>({});
  const frames = useRef(new Map<HTMLIFrameElement, Skill>());
  const lastPosition = useRef(new Map<HTMLIFrameElement, number>());
  const youtubeDuration = useRef(new Map<HTMLIFrameElement, number>());

  useEffect(() => {
    watchRef.current = loadWatchState();
    setWatch(watchRef.current);
  }, []);

  // One ref callback per video, kept across renders: a new function each
  // time would make React detach and re-attach the frame on every update.
  const frameRefs = useRef(new Map<string, (frame: HTMLIFrameElement | null) => (() => void) | void>());
  const trackFrame = useCallback((skill: Skill) => {
    const key = watchKey(skill);
    let callback = frameRefs.current.get(key);
    if (!callback) {
      callback = (frame) => {
        if (!frame) return;
        frames.current.set(frame, skill);
        return () => {
          frames.current.delete(frame);
          lastPosition.current.delete(frame);
          youtubeDuration.current.delete(frame);
        };
      };
      frameRefs.current.set(key, callback);
    }
    return callback;
  }, []);

  useEffect(() => {
    function record(frame: HTMLIFrameElement, skill: Skill, position: number, duration: number) {
      const previous = lastPosition.current.get(frame);
      lastPosition.current.set(frame, position);
      if (!(duration > 0) || previous === undefined) return;
      // Only time that actually played counts: a jump is a seek, and adds
      // nothing.
      const step = position - previous;
      if (step <= 0 || step > 2) return;

      const key = watchKey(skill);
      const entry = watchRef.current[key] ?? { seconds: 0, duration, done: false };
      if (entry.done) return;
      const seconds = Math.min(duration, entry.seconds + step);
      const next: WatchEntry = { seconds, duration, done: seconds >= duration * WATCH_COMPLETE_RATIO };
      watchRef.current = { ...watchRef.current, [key]: next };
      if (watchPercent(next) !== watchPercent(entry)) {
        setWatch(watchRef.current);
        saveWatchState(watchRef.current);
      }
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== VIMEO_ORIGIN && event.origin !== YOUTUBE_ORIGIN) return;
      const found = [...frames.current].find(([frame]) => frame.contentWindow === event.source);
      if (!found) return;
      const [frame, skill] = found;
      let data;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (event.origin === VIMEO_ORIGIN) {
        if (data?.event === "ready") subscribe(frame, skill);
        if (data?.event === "timeupdate") {
          record(frame, skill, Number(data.data?.seconds), Number(data.data?.duration));
        }
      } else if (data?.event === "infoDelivery" && data.info) {
        if (typeof data.info.duration === "number") youtubeDuration.current.set(frame, data.info.duration);
        if (typeof data.info.currentTime === "number") {
          record(frame, skill, data.info.currentTime, youtubeDuration.current.get(frame) ?? 0);
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const doneCount = skills.filter((skill) => watch[watchKey(skill)]?.done).length;
  const allDone = skills.length > 0 && doneCount === skills.length;

  function openModal(skill: Skill) {
    setActiveSkill(skill);
    setModalOpen(true);
  }

  if (skills.length === 0) {
    return (
      <div className="space-y-6">
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 등록된 핵심술기 영상이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-emerald-900">
            <i className="fa-solid fa-award mr-1" /> 영상 {skills.length}개 중 {doneCount}개 시청 완료
          </p>
          <p className="text-xs text-emerald-800">
            영상을 90% 이상 재생하면 시청 완료로 기록됩니다. 건너뛴 구간은 세지 않으며, 기록은 이 기기에
            저장됩니다.
          </p>
        </div>
        <Link
          href="/skills/certificate"
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            allDone
              ? "bg-emerald-600 text-white shadow hover:bg-emerald-500"
              : "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {allDone ? "이수 확인증 받기" : "이수 확인증"} &rarr;
        </Link>
      </div>

      {/* Featured Video Highlight */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row gap-6 items-center">
        <div className="lg:w-1/2 w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg border border-slate-700">
          <iframe
            ref={trackFrame(featured)}
            onLoad={(e) => subscribe(e.currentTarget, featured)}
            className="w-full h-full"
            src={getEmbedUrl(featured, false)}
            title={featured.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="lg:w-1/2 w-full space-y-3">
          <h3 className="text-xl font-bold text-white">{featured.title}</h3>
          <p className="text-sm">
            <WatchStatus entry={watch[watchKey(featured)]} dark />
          </p>
          {featured.desc.trim() !== featured.title.trim() && (
            <p className="text-sm text-slate-300 leading-relaxed">{featured.desc}</p>
          )}
          <button
            onClick={() => openModal(featured)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-list-check" /> 상세 프로토콜 체크리스트
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((skill) => {
          const thumbnail = getThumbnailUrl(skill);
          return (
            <div
              key={skill.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-44 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={skill.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-emerald-950" />
                )}
                <button
                  onClick={() => openModal(skill)}
                  className="absolute w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform"
                >
                  <i className="fa-solid fa-play ml-1" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug">{skill.title}</h3>
                {skill.desc.trim() !== skill.title.trim() && (
                  <p className="text-sm text-slate-500 line-clamp-2">{skill.desc}</p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs whitespace-nowrap">
                  <WatchStatus entry={watch[watchKey(skill)]} />
                  <button onClick={() => openModal(skill)} className="text-emerald-700 font-bold hover:underline">
                    프로토콜 보기 &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && activeSkill && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">{activeSkill.title}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md">
              <iframe
                key={activeSkill.id}
                ref={trackFrame(activeSkill)}
                onLoad={(e) => subscribe(e.currentTarget, activeSkill)}
                className="w-full h-full"
                src={getEmbedUrl(activeSkill, true)}
                title={activeSkill.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-sm">
              <WatchStatus entry={watch[watchKey(activeSkill)]} />
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <i className="fa-solid fa-clipboard-check text-emerald-600" /> 단계별 핵심 수행 지침
                (Checklist)
              </h4>
              <ol className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {activeSkill.steps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
