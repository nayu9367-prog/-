"use client";

import { useState, type FormEvent } from "react";
import type { VisitCase } from "@/lib/casesData";

type FormState = {
  name: string;
  scenario: string;
};

function emptyForm(): FormState {
  return { name: "", scenario: "" };
}

function caseToForm(c: VisitCase): FormState {
  return { name: c.name, scenario: c.scenario };
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
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        대상자 이름 (예: 박OO님)
        <input
          required
          maxLength={50}
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 sm:max-w-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        시나리오 (줄을 바꾸면 학생 화면에서 문단이 나뉩니다)
        <textarea
          required
          rows={14}
          value={form.scenario}
          onChange={(e) => onChange({ ...form, scenario: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none focus:border-emerald-500"
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
    if (!window.confirm("이 시나리오를 삭제하시겠습니까?")) return;
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
        <h2 className="text-lg font-semibold text-slate-800">새 시나리오 등록</h2>
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
        <h2 className="text-lg font-semibold text-slate-800">등록된 시나리오 ({cases.length})</h2>
        {cases.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            아직 등록된 시나리오가 없습니다.
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
                    <h3 className="font-semibold text-slate-900">{c.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{c.scenario}</p>
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
