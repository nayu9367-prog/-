"use client";

import { useState, type FormEvent } from "react";
import { skillCategories, type Skill, type SkillCategory, type VideoProvider } from "@/lib/skillsData";

type FormState = {
  cat: SkillCategory;
  title: string;
  desc: string;
  provider: VideoProvider;
  videoId: string;
  steps: string[];
};

const CATEGORY_OPTIONS = skillCategories.filter((c) => c.id !== "all") as {
  id: SkillCategory;
  label: string;
}[];

function emptyForm(): FormState {
  return {
    cat: CATEGORY_OPTIONS[0].id,
    title: "",
    desc: "",
    provider: "youtube",
    videoId: "",
    steps: [""],
  };
}

function skillToForm(skill: Skill): FormState {
  return {
    cat: skill.cat,
    title: skill.title,
    desc: skill.desc,
    provider: skill.provider,
    videoId: skill.videoId,
    steps: skill.steps.length > 0 ? skill.steps : [""],
  };
}

function categoryLabel(cat: SkillCategory): string {
  return CATEGORY_OPTIONS.find((c) => c.id === cat)?.label ?? cat;
}

function StepsEditor({
  steps,
  onChange,
}: {
  steps: string[];
  onChange: (steps: string[]) => void;
}) {
  function updateStep(idx: number, value: string) {
    onChange(steps.map((s, i) => (i === idx ? value : s)));
  }

  function removeStep(idx: number) {
    onChange(steps.length > 1 ? steps.filter((_, i) => i !== idx) : [""]);
  }

  function addStep() {
    onChange([...steps, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">상세 프로토콜 체크리스트</label>
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
            {idx + 1}
          </span>
          <input
            value={step}
            onChange={(e) => updateStep(idx, e.target.value)}
            placeholder={`단계 ${idx + 1} 내용`}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => removeStep(idx)}
            className="shrink-0 rounded-md border border-rose-200 px-2 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
          >
            삭제
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addStep}
        className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        + 단계 추가
      </button>
    </div>
  );
}

function SkillFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (form: FormState) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          카테고리
          <select
            value={form.cat}
            onChange={(e) => onChange({ ...form, cat: e.target.value as SkillCategory })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          영상 플랫폼
          <select
            value={form.provider}
            onChange={(e) => onChange({ ...form, provider: e.target.value as VideoProvider })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        제목
        <input
          required
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="예: 피내주사(Intradermal Injection) 시행 방법"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        설명
        <textarea
          required
          rows={2}
          value={form.desc}
          onChange={(e) => onChange({ ...form, desc: e.target.value })}
          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        {form.provider === "vimeo" ? "Vimeo 영상 ID" : "YouTube 영상 ID"}
        <input
          required
          value={form.videoId}
          onChange={(e) => onChange({ ...form, videoId: e.target.value })}
          placeholder={
            form.provider === "vimeo"
              ? "vimeo.com/1053660866 → 1053660866"
              : "youtube.com/watch?v=XXXXXXXXXXX → XXXXXXXXXXX"
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
        />
      </label>
      <StepsEditor
        steps={form.steps}
        onChange={(steps) => onChange({ ...form, steps })}
      />
    </div>
  );
}

export default function SkillsAdmin({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function buildPayload(form: FormState) {
    return {
      cat: form.cat,
      tag: categoryLabel(form.cat),
      title: form.title.trim(),
      desc: form.desc.trim(),
      provider: form.provider,
      videoId: form.videoId.trim(),
      steps: form.steps.map((s) => s.trim()).filter(Boolean),
    };
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(createForm)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setSkills((prev) => [...prev, data.skill]);
      setCreateForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);
    setEditForm(skillToForm(skill));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  async function handleUpdate(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(editForm)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "수정에 실패했습니다.");
      setSkills((prev) => prev.map((s) => (s.id === id ? data.skill : s)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 핵심술기 항목을 삭제하시겠습니까?")) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setSkills((prev) => prev.filter((s) => s.id !== id));
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
        <h2 className="text-lg font-semibold text-slate-800">새 핵심술기 영상 등록</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <SkillFormFields form={createForm} onChange={setCreateForm} />
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
        <h2 className="text-lg font-semibold text-slate-800">핵심술기 영상 목록 ({skills.length})</h2>
        {skills.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            등록된 핵심술기 영상이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {skills.map((skill) => (
              <li key={skill.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {editingId === skill.id ? (
                  <div className="flex flex-col gap-3">
                    <SkillFormFields form={editForm} onChange={setEditForm} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(skill.id)}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {skill.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">{skill.provider}</span>
                      <h3 className="font-semibold text-slate-900">{skill.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{skill.desc}</p>
                    <ol className="text-xs text-slate-500 list-decimal list-inside space-y-0.5">
                      {skill.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => startEdit(skill)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
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
