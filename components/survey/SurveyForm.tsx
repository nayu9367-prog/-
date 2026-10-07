"use client";

import { useState, type FormEvent } from "react";
import StudentGate from "@/components/StudentGate";
import { MAX_SURVEY_TEXT_LENGTH, type Survey, type SurveyKey } from "@/lib/surveys";

export default function SurveyForm({ surveyKey, survey }: { surveyKey: SurveyKey; survey: Survey }) {
  // Null until the student has confirmed their ID and PIN.
  const [studentId, setStudentId] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [choices, setChoices] = useState<(number | null)[]>(
    Array(survey.choiceQuestions.length).fill(null)
  );
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleReady(confirmedId: string) {
    setStudentId(confirmedId);
    try {
      const response = await fetch(`/api/survey?survey=${surveyKey}`);
      const data = await response.json().catch(() => ({}));
      setAlreadySubmitted(response.ok && data.submitted === true);
    } catch {
      // Not knowing is fine: answering again just replaces the response.
    }
  }

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
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!studentId) {
    return (
      <StudentGate
        title="학번을 확인하고 설문을 시작하세요"
        description="응답은 학번과 함께 저장되어 담당 교수님만 확인할 수 있습니다."
        startLabel="설문 시작하기"
        onReady={handleReady}
      />
    );
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-2 max-w-3xl mx-auto">
        <i className="fa-solid fa-circle-check text-3xl text-emerald-600" />
        <h4 className="font-bold text-slate-800">응답이 제출되었습니다. 감사합니다!</h4>
        <p className="text-xs text-slate-500">소중한 의견은 실습 운영에 반영하겠습니다.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-3xl mx-auto"
    >
      {alreadySubmitted && (
        <p className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700">
          이미 응답한 설문입니다. 다시 제출하면 이전 응답이 새 응답으로 바뀝니다.
        </p>
      )}

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
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs md:text-sm transition-all ${
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
            className="rounded-xl border border-slate-200 p-3.5 text-xs md:text-sm font-normal text-slate-800 outline-none focus:border-emerald-500"
          />
        </label>
      )}

      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-xs text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? "제출 중..." : "응답 제출하기"}
      </button>
    </form>
  );
}
