"use client";

import { useState } from "react";
import {
  MAX_SURVEY_CHOICE_QUESTIONS,
  SURVEY_KEYS,
  SURVEY_LABELS,
  type Survey,
  type SurveyKey,
  type SurveyResponse,
  type SurveySettings,
} from "@/lib/surveys";

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500";

function SurveyResults({
  survey,
  responses,
}: {
  survey: Survey;
  responses: Record<string, SurveyResponse>;
}) {
  const list = Object.values(responses);
  const texts = list.map((r) => r.text).filter(Boolean);

  if (list.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">아직 제출된 응답이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {survey.choiceQuestions.map((q, qIdx) => (
        <div key={qIdx} className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-slate-800">
            {qIdx + 1}. {q.question}
          </p>
          {q.options.map((opt, optIdx) => {
            const count = list.filter((r) => r.choices[qIdx] === optIdx).length;
            const percent = Math.round((count / list.length) * 100);
            return (
              <div key={optIdx} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-32 shrink-0 truncate">{opt}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right">
                  {count}명 ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      ))}
      {survey.textQuestion && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-slate-800">
            {survey.choiceQuestions.length + 1}. {survey.textQuestion} ({texts.length}건)
          </p>
          <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto custom-scrollbar">
            {texts.map((text, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 whitespace-pre-line"
              >
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SurveysAdmin({
  initialSettings,
  responses,
}: {
  initialSettings: SurveySettings;
  responses: Record<SurveyKey, Record<string, SurveyResponse>>;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [active, setActive] = useState<SurveyKey>("pre");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const survey = settings[active];
  const responseCount = Object.keys(responses[active]).length;

  function update(patch: Partial<Survey>) {
    setSettings((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
  }
  function updateQuestion(idx: number, patch: { question?: string; options?: string[] }) {
    update({
      choiceQuestions: survey.choiceQuestions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    });
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/surveys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setSettings(data.settings);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">요구도 조사 관리</h2>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
        <a
          href="/api/survey/export"
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 transition-all flex items-center gap-1.5"
        >
          <i className="fa-solid fa-file-excel" /> 응답 엑셀 다운로드
        </a>
      </div>

      <div className="flex gap-2">
        {SURVEY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
              active === key
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {SURVEY_LABELS[key]} ({Object.keys(responses[key]).length}명 응답)
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 설문 페이지에 바로 반영됩니다.
          </p>
        )}
        {responseCount > 0 && (
          <p className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700">
            이미 {responseCount}명이 응답했습니다. 문항이나 보기의 순서·개수를 바꾸면 기존 응답과
            어긋날 수 있으니, 응답을 받기 시작한 뒤에는 문구만 다듬어 주세요.
          </p>
        )}

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={survey.open}
            onChange={(e) => update({ open: e.target.checked })}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
          />
          응답 받기 (끄면 학생에게 &lsquo;아직 응답을 받지 않는 설문&rsquo;이라고 보입니다)
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          안내 문구
          <textarea
            rows={2}
            value={survey.intro}
            onChange={(e) => update({ intro: e.target.value })}
            className={inputClass}
          />
        </label>

        {survey.choiceQuestions.map((q, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">객관식 {idx + 1}</span>
              <button
                type="button"
                onClick={() =>
                  update({ choiceQuestions: survey.choiceQuestions.filter((_, i) => i !== idx) })
                }
                className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              >
                삭제
              </button>
            </div>
            <input
              value={q.question}
              onChange={(e) => updateQuestion(idx, { question: e.target.value })}
              placeholder="문항 내용"
              className={inputClass}
            />
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              보기 (한 줄에 하나씩)
              <textarea
                rows={5}
                value={q.options.join("\n")}
                onChange={(e) => updateQuestion(idx, { options: e.target.value.split("\n") })}
                className={inputClass}
              />
            </label>
          </div>
        ))}

        <button
          type="button"
          disabled={survey.choiceQuestions.length >= MAX_SURVEY_CHOICE_QUESTIONS}
          onClick={() =>
            update({
              choiceQuestions: [
                ...survey.choiceQuestions,
                { question: "", options: survey.choiceQuestions.at(-1)?.options ?? ["", ""] },
              ],
            })
          }
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
        >
          + 객관식 문항 추가
        </button>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          주관식 문항 (비워 두면 주관식 없이 진행됩니다)
          <textarea
            rows={2}
            value={survey.textQuestion}
            onChange={(e) => update({ textQuestion: e.target.value })}
            className={inputClass}
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "요구도 조사 저장"}
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="font-bold text-slate-800 text-sm">
          {SURVEY_LABELS[active]} 응답 결과 ({responseCount}명)
        </h3>
        <SurveyResults survey={initialSettings[active]} responses={responses[active]} />
      </div>
    </div>
  );
}
