"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { SAFETY_BLOCKS, SAFETY_TABS, type SafetySettings } from "@/lib/safetySettings";

export default function SafetyGuide({ settings }: { settings: SafetySettings }) {
  const [current, setCurrent] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tab = SAFETY_TABS[current];
  const blocks = SAFETY_BLOCKS.filter((block) => block.tab === tab.key);

  // The step buttons sit below the cards, so the next section would
  // otherwise open scrolled to its end.
  function step(by: number) {
    const to = current + by;
    if (to < 0 || to >= SAFETY_TABS.length) return;
    setCurrent(to);
    tabRefs.current[to]?.focus({ preventScroll: true });
    topRef.current?.scrollIntoView({ block: "start" });
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const by = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (by === 0) return;
    event.preventDefault();
    const to = (current + by + SAFETY_TABS.length) % SAFETY_TABS.length;
    setCurrent(to);
    tabRefs.current[to]?.focus();
  }

  return (
    <div ref={topRef} className="space-y-5 scroll-mt-24">
      <div role="tablist" aria-label="안내 항목" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SAFETY_TABS.map((t, idx) => {
          const selected = idx === current;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`safety-tab-${t.key}`}
              aria-selected={selected}
              aria-controls="safety-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setCurrent(idx)}
              onKeyDown={handleTabKey}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              }`}
            >
              <i className={t.icon} />
              <span>
                {idx + 1}. {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="safety-panel"
        aria-labelledby={`safety-tab-${tab.key}`}
        tabIndex={0}
        className="space-y-6 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {blocks.map((block) => {
          const items = settings.blocks[block.key] ?? [];
          return (
            <section key={block.key} className="space-y-3">
              <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="h-4 w-1.5 rounded-full bg-emerald-600" /> {block.heading}
              </h4>

              {"image" in block && (
                <a
                  href={block.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={block.image}
                    alt={`${block.heading} 그림 (누르면 크게 보기)`}
                    width={block.imageWidth}
                    height={block.imageHeight}
                    className="mx-auto h-auto w-full max-w-2xl"
                  />
                </a>
              )}

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {items.map((item, idx) => (
                  <div
                    key={`${idx}-${item.title}`}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700">
                      <i className={item.icon} />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                      {item.desc && (
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{item.desc}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={current === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
        >
          <i className="fa-solid fa-arrow-left" /> 이전
        </button>
        <span className="text-xs font-bold text-slate-500">
          {current + 1} / {SAFETY_TABS.length}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={current === SAFETY_TABS.length - 1}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
        >
          다음 <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
