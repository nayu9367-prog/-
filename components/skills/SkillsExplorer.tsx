"use client";

import { useState } from "react";
import { skillCategories, skillsData, type Skill, type SkillCategory } from "@/lib/skillsData";

function getEmbedUrl(skill: Skill, autoplay: boolean): string {
  if (skill.provider === "vimeo") {
    return `https://player.vimeo.com/video/${skill.videoId}${autoplay ? "?autoplay=1" : ""}`;
  }
  return `https://www.youtube.com/embed/${skill.videoId}${autoplay ? "?autoplay=1" : ""}`;
}

function getThumbnailUrl(skill: Skill): string | null {
  if (skill.provider === "youtube") {
    return `https://img.youtube.com/vi/${skill.videoId}/hqdefault.jpg`;
  }
  return null;
}

export default function SkillsExplorer() {
  const [filter, setFilter] = useState<SkillCategory | "all">("all");
  const [activeSkill, setActiveSkill] = useState<Skill>(skillsData[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = filter === "all" ? skillsData : skillsData.filter((s) => s.cat === filter);
  const featured = skillsData[0];

  function openModal(skill: Skill) {
    setActiveSkill(skill);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {skillCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === cat.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Video Highlight */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row gap-6 items-center">
        <div className="lg:w-1/2 w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg border border-slate-700">
          <iframe
            className="w-full h-full"
            src={getEmbedUrl(featured, false)}
            title={featured.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="lg:w-1/2 w-full space-y-3">
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
            대표 실습 영상 #1
          </span>
          <h3 className="text-xl font-bold text-white">{featured.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{featured.desc}</p>
          <button
            onClick={() => openModal(featured)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-list-check" /> 상세 프로토콜 체크리스트
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((skill) => {
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
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  {skill.tag}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug">{skill.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{skill.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold">
                    <i className="fa-solid fa-circle-check" /> 동영상 & 체크리스트
                  </span>
                  <button onClick={() => openModal(skill)} className="text-emerald-700 font-bold hover:underline">
                    프로토콜 보기 &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  {activeSkill.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-800">{activeSkill.title}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(activeSkill, true)}
                title={activeSkill.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <i className="fa-solid fa-clipboard-check text-emerald-600" /> 단계별 핵심 수행 지침
                (Checklist)
              </h4>
              <ol className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition-all"
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
