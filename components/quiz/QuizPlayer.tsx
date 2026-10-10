"use client";

import { useState } from "react";
import { isEssayQuestion, type QuizQuestionForStudent, type QuizResult } from "@/lib/quizData";
import { getVisitorId } from "@/lib/visitorId";
import StudentGate from "@/components/StudentGate";

export default function QuizPlayer({
  initialQuestions,
}: {
  initialQuestions: QuizQuestionForStudent[];
}) {
  // One attempt's questions: a random draw from the question bank. The
  // server picks the first set; each retry fetches a fresh one.
  const [questions, setQuestions] = useState(initialQuestions);
  const [loadingNext, setLoadingNext] = useState(false);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(initialQuestions.length).fill(null)
  );
  // Written answers to essay questions, by question position.
  const [texts, setTexts] = useState<string[]>(Array(initialQuestions.length).fill(""));
  // Answers and explanations only exist on the server until the attempt is
  // submitted; the graded results come back in the response.
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    if (submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: getVisitorId(),
          answers: questions.map((q, idx) => ({
            questionId: q.id,
            selectedIndex: answers[idx],
            answerText: texts[idx],
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.results)) {
        throw new Error(data.error || "제출에 실패했습니다.");
      }
      setResults(data.results);
    } catch (err) {
      setSubmitError(
        `${err instanceof Error ? err.message : "제출에 실패했습니다."} 작성한 답은 그대로 있으니 다시 눌러 주세요.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 max-w-3xl mx-auto">
        아직 등록된 퀴즈 문제가 없습니다.
      </p>
    );
  }

  if (!started) {
    return (
      <StudentGate
        title="학번을 확인하고 퀴즈를 시작하세요"
        description="점수는 학번과 함께 저장되어 '내 기록 보기'에서 다시 볼 수 있고, 담당 교수님도 확인할 수 있습니다."
        startLabel="퀴즈 시작하기"
        onReady={() => setStarted(true)}
      />
    );
  }

  const isLast = index === questions.length - 1;

  async function reset() {
    setLoadingNext(true);
    let next = questions;
    try {
      const response = await fetch("/api/quiz/random");
      const data = await response.json();
      if (response.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        next = data.questions;
      }
    } catch {
      // Keep the current set; retrying the same questions beats a dead end.
    }
    setQuestions(next);
    setIndex(0);
    setAnswers(Array(next.length).fill(null));
    setTexts(Array(next.length).fill(""));
    setResults(null);
    setStarted(false);
    setLoadingNext(false);
  }

  if (results) {
    // Essay answers aren't graded, so the score covers multiple choice only.
    const graded = results.filter((r) => r.answerText === null);
    const essayCount = results.length - graded.length;
    const correctCount = graded.filter((r) => r.isCorrect).length;
    const score = graded.length > 0 ? Math.round((correctCount / graded.length) * 100) : 0;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
        <div className="text-center py-4 px-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          {graded.length > 0 ? (
            <>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">최종 점수</span>
              <h3 className="text-3xl font-black text-emerald-700 mt-1">{score} / 100점</h3>
              <p className="text-sm text-slate-500 mt-1">
                {score >= 80
                  ? "🎉 대단합니다! 지역사회간호학 실습 개념을 잘 이해하고 계시네요!"
                  : "💪 부족한 오답 개념을 해설과 함께 다시 복습해보세요."}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {essayCount > 0 && "객관식 "}
                {correctCount} / {graded.length}문항 정답
              </p>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">제출 완료</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">서술형 {essayCount}문항</h3>
            </>
          )}
          {essayCount > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              서술형 문항은 점수에 포함되지 않습니다. 아래 모범답안과 내 답안을 비교해 보세요.
            </p>
          )}
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">문제별 상세 해설·오답 노트</h4>
          {results.map((r) => {
            if (r.answerText !== null) {
              return (
                <div
                  key={r.questionId}
                  className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-1.5 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 break-words font-bold text-slate-800 whitespace-pre-line">{r.question}</span>
                    <span className="text-sky-700 font-bold shrink-0">✏️ 서술형</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line">
                    <b>내 답안:</b> {r.answerText || "미응답"}
                  </p>
                  <p className="text-slate-500 text-xs bg-white p-2.5 rounded-lg border border-slate-100 mt-1 whitespace-pre-line">
                    💡 <b>모범답안:</b> {r.explanation}
                  </p>
                </div>
              );
            }
            const userChoice =
              r.selectedIndex !== null ? (r.options[r.selectedIndex] ?? "미응답") : "미응답";
            return (
              <div
                key={r.questionId}
                className={`p-4 rounded-xl border ${
                  r.isCorrect ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"
                } space-y-1.5 text-sm`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 break-words font-bold text-slate-800">{r.question}</span>
                  <span className={r.isCorrect ? "text-emerald-700 font-bold shrink-0" : "text-rose-600 font-bold shrink-0"}>
                    {r.isCorrect ? "⭕ 정답" : "❌ 오답"}
                  </span>
                </div>
                <p className="text-slate-600">
                  내 선택: <b>{userChoice}</b> | 정답:{" "}
                  <b className="text-emerald-700">{r.options[r.correctIndex]}</b>
                </p>
                <p className="text-slate-500 text-xs bg-white p-2.5 rounded-lg border border-slate-100 mt-1">
                  💡 <b>해설:</b> {r.explanation}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center pt-2">
          <button
            onClick={reset}
            disabled={loadingNext}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-rotate-right" /> {loadingNext ? "새 문제 불러오는 중..." : "새 문제로 다시 풀기"}
          </button>
        </div>
      </div>
    );
  }

  const current = questions[index];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          문제 {index + 1} / {questions.length}
        </span>
        <span className="text-xs text-slate-400 font-medium">지역사회간호학 실습 대비</span>
      </div>
      <h3 className="text-base font-bold text-slate-800 whitespace-pre-line break-words">{current.question}</h3>
      {isEssayQuestion(current) && (
        <div className="pt-2 space-y-1.5">
          <textarea
            rows={7}
            maxLength={2000}
            value={texts[index]}
            onChange={(e) => {
              const value = e.target.value;
              setTexts((prev) => prev.map((v, i) => (i === index ? value : v)));
            }}
            placeholder="답안을 직접 작성해 주세요."
            className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 outline-none focus:border-emerald-500"
          />
          <p className="text-xs text-slate-400">
            서술형 문항입니다. 제출하면 모범답안을 볼 수 있고, 점수에는 포함되지 않습니다.
          </p>
        </div>
      )}
      <div className="space-y-2 pt-2" role="radiogroup" aria-label="보기">
        {current.options.map((opt, idx) => {
          const isSelected = answers[index] === idx;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setAnswers((prev) => prev.map((v, i) => (i === index ? idx : v)))}
              className={`w-full min-h-11 text-left p-3.5 rounded-xl border transition-all text-sm flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span className="min-w-0 break-words">
                {idx + 1}. {opt}
              </span>
              {/* The mark, not just the colour, says which option is chosen. */}
              {isSelected ? (
                <i className="fa-solid fa-circle-check shrink-0 text-lg text-emerald-600" aria-hidden="true" />
              ) : (
                <i className="fa-regular fa-circle shrink-0 text-lg text-slate-300" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={() => setIndex((v) => Math.max(0, v - 1))}
          disabled={index === 0}
          className="min-h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &larr; 이전 문제
        </button>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="min-h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "채점 중..." : "결과 제출하기"}
          </button>
        ) : (
          <button
            onClick={() => setIndex((v) => Math.min(questions.length - 1, v + 1))}
            className="min-h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md"
          >
            다음 문제 &rarr;
          </button>
        )}
      </div>
      {submitError && (
        <p role="alert" className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {submitError}
        </p>
      )}
    </div>
  );
}
