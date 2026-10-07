"use client";

import { useState, type FormEvent } from "react";
import { isEssayQuestion, type QuizQuestion } from "@/lib/quizData";
import type { QuizSettings } from "@/lib/quizSettings";
import QuizCountSetting from "@/components/admin/QuizCountSetting";
import QuizPdfImport from "@/components/admin/QuizPdfImport";

type FormState = {
  // An essay question has no options; its explanation is the model answer.
  essay: boolean;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

function emptyForm(): FormState {
  return { essay: false, question: "", options: ["", ""], answer: 0, explanation: "" };
}

function quizToForm(q: QuizQuestion): FormState {
  const essay = isEssayQuestion(q);
  return {
    essay,
    question: q.question,
    options: essay ? ["", ""] : [...q.options],
    answer: essay ? 0 : q.answer,
    explanation: q.explanation,
  };
}

function QuizFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (form: FormState) => void;
}) {
  function updateOption(idx: number, value: string) {
    onChange({ ...form, options: form.options.map((o, i) => (i === idx ? value : o)) });
  }

  function removeOption(idx: number) {
    if (form.options.length <= 2) return;
    const options = form.options.filter((_, i) => i !== idx);
    const answer = form.answer === idx ? 0 : form.answer > idx ? form.answer - 1 : form.answer;
    onChange({ ...form, options, answer });
  }

  function addOption() {
    onChange({ ...form, options: [...form.options, ""] });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        문제 유형
        <div className="flex gap-2">
          {[
            { essay: false, label: "객관식" },
            { essay: true, label: "서술형" },
          ].map((type) => (
            <button
              key={type.label}
              type="button"
              onClick={() => onChange({ ...form, essay: type.essay })}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                form.essay === type.essay
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        질문
        <textarea
          required
          rows={form.essay ? 4 : 2}
          value={form.question}
          onChange={(e) => onChange({ ...form, question: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>

      {!form.essay && (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          보기 (정답에 표시된 보기가 채점 기준이 됩니다)
        </label>
        {form.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name="answer"
              checked={form.answer === idx}
              onChange={() => onChange({ ...form, answer: idx })}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              title="정답으로 선택"
            />
            <input
              required
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`보기 ${idx + 1}`}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => removeOption(idx)}
              disabled={form.options.length <= 2}
              className="shrink-0 rounded-md border border-rose-200 px-2 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          + 보기 추가
        </button>
      </div>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        {form.essay ? "모범답안 (학생이 제출한 뒤에 보여 줍니다)" : "해설"}
        <textarea
          required
          rows={form.essay ? 6 : 2}
          value={form.explanation}
          onChange={(e) => onChange({ ...form, explanation: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>
    </div>
  );
}

export default function QuizAdmin({
  initialQuestions,
  initialSettings,
}: {
  initialQuestions: QuizQuestion[];
  initialSettings: QuizSettings;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function buildPayload(form: FormState) {
    return {
      question: form.question.trim(),
      options: form.essay ? [] : form.options.map((o) => o.trim()).filter(Boolean),
      answer: form.essay ? 0 : form.answer,
      explanation: form.explanation.trim(),
    };
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(createForm)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setQuestions((prev) => [...prev, data.question]);
      setCreateForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(q: QuizQuestion) {
    setEditingId(q.id);
    setEditForm(quizToForm(q));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  async function handleUpdate(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/quiz/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(editForm)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "수정에 실패했습니다.");
      setQuestions((prev) => prev.map((q) => (q.id === id ? data.question : q)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 퀴즈 문제를 삭제하시겠습니까?")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/quiz/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <QuizCountSetting initialSettings={initialSettings} bankSize={questions.length} />

      <QuizPdfImport
        existingQuestions={questions}
        onImported={(imported) => setQuestions((prev) => [...prev, ...imported])}
      />

      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">새 퀴즈 문제 등록</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <QuizFormFields form={createForm} onChange={setCreateForm} />
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            등록
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">문제 은행 ({questions.length}문제)</h2>
        {questions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            등록된 퀴즈 문제가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {questions.map((q, qIdx) => (
              <li key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {editingId === q.id ? (
                  <div className="flex flex-col gap-3">
                    <QuizFormFields form={editForm} onChange={setEditForm} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(q.id)}
                        disabled={busy}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-slate-900 whitespace-pre-line">
                      {qIdx + 1}. {q.question}
                      {isEssayQuestion(q) && (
                          <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                            서술형
                          </span>
                      )}
                    </h3>
                    <ul className="text-sm text-slate-600 space-y-0.5">
                      {q.options.map((opt, idx) => (
                        <li
                          key={idx}
                          className={idx === q.answer ? "font-bold text-emerald-700" : ""}
                        >
                          {idx + 1}. {opt} {idx === q.answer && "✓"}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 whitespace-pre-line">
                      💡 {q.explanation}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={busy}
                        className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
