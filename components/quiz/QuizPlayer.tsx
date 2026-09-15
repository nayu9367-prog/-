"use client";

import { useState } from "react";
import { quizData } from "@/lib/quizData";

export default function QuizPlayer() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quizData.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);

  const isLast = index === quizData.length - 1;

  function reset() {
    setIndex(0);
    setAnswers(Array(quizData.length).fill(null));
    setSubmitted(false);
  }

  if (submitted) {
    let score = 0;
    let correctCount = 0;
    quizData.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        score += 20;
        correctCount++;
      }
    });

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="text-center py-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">최종 점수</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-1">{score} / 100점</h3>
          <p className="text-xs text-slate-500 mt-1">
            {score >= 80
              ? "🎉 대단합니다! 지역사회간호학 실습 개념을 잘 이해하고 계시네요!"
              : "💪 부족한 오답 개념을 해설과 함께 다시 복습해보세요."}
          </p>
          <p className="text-xs text-slate-400 mt-1">{correctCount} / {quizData.length}문항 정답</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">문제별 상세 해설 & 오답 노트</h4>
          {quizData.map((q, idx) => {
            const isCorrect = answers[idx] === q.answer;
            const userChoice = answers[idx] !== null ? q.options[answers[idx]!] : "미응답";
            return (
              <div
                key={q.question}
                className={`p-4 rounded-xl border ${
                  isCorrect ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"
                } space-y-1.5 text-xs`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">{q.question}</span>
                  <span className={isCorrect ? "text-emerald-700 font-bold shrink-0" : "text-rose-600 font-bold shrink-0"}>
                    {isCorrect ? "⭕ 정답" : "❌ 오답"}
                  </span>
                </div>
                <p className="text-slate-600">
                  내 선택: <b>{userChoice}</b> | 정답: <b className="text-emerald-700">{q.options[q.answer]}</b>
                </p>
                <p className="text-slate-500 text-[11px] bg-white p-2.5 rounded-lg border border-slate-100 mt-1">
                  💡 <b>해설:</b> {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center pt-2">
          <button
            onClick={reset}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right" /> 퀴즈 다시 풀기
          </button>
        </div>
      </div>
    );
  }

  const current = quizData[index];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          문제 {index + 1} / {quizData.length}
        </span>
        <span className="text-xs text-slate-400 font-medium">지역사회간호학 실습 대비</span>
      </div>
      <h3 className="text-base font-bold text-slate-800">{current.question}</h3>
      <div className="space-y-2 pt-2">
        {current.options.map((opt, idx) => {
          const isSelected = answers[index] === idx;
          return (
            <button
              key={opt}
              onClick={() => setAnswers((prev) => prev.map((v, i) => (i === index ? idx : v)))}
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs md:text-sm flex items-center justify-between ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>
                {idx + 1}. {opt}
              </span>
              {isSelected ? (
                <i className="fa-solid fa-circle-check text-emerald-600" />
              ) : (
                <i className="fa-regular fa-circle text-slate-300" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <button
          onClick={() => setIndex((v) => Math.max(0, v - 1))}
          disabled={index === 0}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &larr; 이전 문제
        </button>
        {isLast ? (
          <button
            onClick={() => setSubmitted(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-md"
          >
            결과 제출하기
          </button>
        ) : (
          <button
            onClick={() => setIndex((v) => Math.min(quizData.length - 1, v + 1))}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-md"
          >
            다음 문제 &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
