"use client";

import { useState, type FormEvent } from "react";
import type { VisitCase } from "@/lib/casesData";

type FormState = {
  category: string;
  title: string;
  summary: string;
  patientInfo: string;
  assessment: string;
  omahaDiagnosis: string;
  interventions: string;
};

function emptyForm(): FormState {
  return {
    category: "",
    title: "",
    summary: "",
    patientInfo: "",
    assessment: "",
    omahaDiagnosis: "",
    interventions: "",
  };
}

function caseToForm(c: VisitCase): FormState {
  return {
    category: c.category,
    title: c.title,
    summary: c.summary,
    patientInfo: c.patientInfo,
    assessment: c.assessment,
    omahaDiagnosis: c.omahaDiagnosis,
    interventions: c.interventions,
  };
}

function CaseFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (form: FormState) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          질환/사례 분류 (예: 고혈압, 당뇨)
          <input
            required
            value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          사례 제목
          <input
            required
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        한 줄 요약 (카드 목록에 표시)
        <input
          required
          value={form.summary}
          onChange={(e) => onChange({ ...form, summary: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        대상자 정보 (나이, 성별, 진단명, 병력 등)
        <textarea
          required
          rows={3}
          value={form.patientInfo}
          onChange={(e) => onChange({ ...form, patientInfo: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        주요 사정 소견
        <textarea
          required
          rows={3}
          value={form.assessment}
          onChange={(e) => onChange({ ...form, assessment: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        OMAHA 진단
        <textarea
          required
          rows={2}
          value={form.omahaDiagnosis}
          onChange={(e) => onChange({ ...form, omahaDiagnosis: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        간호중재 계획
        <textarea
          required
          rows={3}
          value={form.interventions}
          onChange={(e) => onChange({ ...form, interventions: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>
    </div>
  );
}

export default function CasesAdmin({ initialCases }: { initialCases: VisitCase[] }) {
  const [cases, setCases] = useState(initialCases);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setCases((prev) => [...prev, data.case]);
      setCreateForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(c: VisitCase) {
    setEditingId(c.id);
    setEditForm(caseToForm(c));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  async function handleUpdate(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "수정에 실패했습니다.");
      setCases((prev) => prev.map((c) => (c.id === id ? data.case : c)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 사례를 삭제하시겠습니까?")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">새 방문간호 사례 등록</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <CaseFormFields form={createForm} onChange={setCreateForm} />
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
        <h2 className="text-lg font-semibold text-slate-800">등록된 사례 ({cases.length})</h2>
        {cases.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            아직 등록된 사례가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cases.map((c) => (
              <li key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {editingId === c.id ? (
                  <div className="flex flex-col gap-3">
                    <CaseFormFields form={editForm} onChange={setEditForm} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(c.id)}
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
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {c.category}
                      </span>
                      <h3 className="font-semibold text-slate-900">{c.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{c.summary}</p>
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
