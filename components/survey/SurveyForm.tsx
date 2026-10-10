"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MAX_SURVEY_TEXT_LENGTH, type Survey, type SurveyKey } from "@/lib/surveys";

export default function SurveyForm({ surveyKey, survey }: { surveyKey: SurveyKey; survey: Survey }) {
  // The surveys are anonymous, so the server can't tell who has answered.
  // This browser remembers that it has, to stop an accidental second go.
  const storageKey = `nursihub_survey_done_${surveyKey}`;
  const [answeredBefore, setAnsweredBefore] = useState(false);
  const [choices, setChoices] = useState<(number | null)[]>(
    Array(survey.choiceQuestions.length).fill(null)
  );
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setAnsweredBefore(window.localStorage.getItem(storageKey) !== null);
    } catch {
      // localStorage 접근 불가 시 그대로 응답을 받는다
    }
  }, [storageKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (choices.some((c) => c === null)) {
      setError("객관식 문항에 모두 응답해주세요.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ survey: surveyKey, choices, text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "제출에 실패했습니다.");
      try {
        window.localStorage.setItem(storageKey, new Date().toISOString());
      } catch {
        // 저장 실패는 무시 (중복 제출 안내만 생략된다)
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-2 max-w-3xl mx-auto">
        <i className="fa-solid fa-circle-check text-3xl text-emerald-600" />
        <h4 className="font-bold text-slate-800">응답이 제출되었습니다. 감사합니다!</h4>
        <p className="text-sm text-slate-500">소중한 의견은 실습 운영에 반영하겠습니다.</p>
      </div>
    );
  }

  if (answeredBefore) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-3 max-w-3xl mx-auto">
        <i className="fa-solid fa-circle-check text-3xl text-emerald-600" />
        <h4 className="font-bold text-slate-800">이 기기에서 이미 응답을 제출했습니다. 감사합니다!</h4>
        <button
          type="button"
          onClick={() => setAnsweredBefore(false)}
          className="min-h-11 px-3 text-sm font-semibold text-slate-500 hover:underline"
        >
          다른 사람이 이 기기로 응답하기
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-3xl mx-auto"
    >
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm leading-relaxed text-emerald-800">
        <i className="fa-solid fa-user-secret mr-1.5" />이 설문은 익명입니다. 학번과 이름을 묻지 않으며,
        누가 응답했는지는 저장되지 않습니다.
      </p>

      {survey.choiceQuestions.map((q, qIdx) => (
        <fieldset key={qIdx} className="space-y-2">
          <legend className="text-sm font-bold text-slate-800 whitespace-pre-line">
            {qIdx + 1}. {q.question}
          </legend>
          <div className="space-y-1.5">
            {q.options.map((opt, optIdx) => {
              const isSelected = choices[qIdx] === optIdx;
              return (
                <label
                  key={optIdx}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`choice-${qIdx}`}
                    checked={isSelected}
                    onChange={() => setChoices((prev) => prev.map((v, i) => (i === qIdx ? optIdx : v)))}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {survey.textQuestion && (
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-800 whitespace-pre-line">
          {survey.choiceQuestions.length + 1}. {survey.textQuestion}
          <textarea
            rows={5}
            maxLength={MAX_SURVEY_TEXT_LENGTH}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="자유롭게 작성해 주세요."
            className="rounded-xl border border-slate-200 p-3.5 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500"
          />
        </label>
      )}

      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? "제출 중..." : "응답 제출하기"}
      </button>
    </form>
  );
}
