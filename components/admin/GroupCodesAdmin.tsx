"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import {
  MIN_GROUP_CODE_LENGTH,
  type GroupCode,
  type GroupCodesSettings,
  type GroupLogin,
} from "@/lib/groupCodesData";

// A row not yet saved has no ID; the server gives it one.
type Row = Omit<GroupCode, "id"> & { id?: string };

const DEFAULT_GROUP_COUNT = 8;

function toRows(settings: GroupCodesSettings): Row[] {
  if (settings.groups.length > 0) return settings.groups;
  // Nothing saved yet: start with the groups named and the codes to fill in.
  return Array.from({ length: DEFAULT_GROUP_COUNT }, (_, idx) => ({
    name: `${idx + 1}조`,
    code: "",
    active: true,
  }));
}

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500";

export default function GroupCodesAdmin({
  initialSettings,
  logins,
}: {
  initialSettings: GroupCodesSettings;
  logins: Record<string, GroupLogin>;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initialSettings));
  const [savedCount, setSavedCount] = useState(
    initialSettings.groups.filter((group) => group.active).length
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }
  function remove(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const response = await fetch("/api/settings/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: rows }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "저장에 실패했습니다.");
      const saved: GroupCodesSettings = data.settings;
      setRows(saved.groups);
      setSavedCount(saved.groups.filter((group) => group.active).length);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">조 코드 관리</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p
          className={`rounded-md border px-4 py-2.5 text-sm font-semibold ${
            savedCount > 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {savedCount > 0
            ? `지금 학생은 조 코드로 입장합니다. (사용 중인 조 ${savedCount}개)`
            : "지금 학생은 기존 입장 비밀번호로 입장합니다. 조 코드를 저장하면 조 코드 입장으로 바뀝니다."}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-500">
          <li>
            조 코드를 하나라도 &lsquo;사용&rsquo;으로 저장하면, 학생은 기존 입장 비밀번호 대신 조 코드로만
            들어올 수 있습니다.
          </li>
          <li>
            코드는 {MIN_GROUP_CODE_LENGTH}자 이상으로, 조마다 다르게 정해 주세요. 대문자와 소문자는
            구분하지 않습니다.
          </li>
          <li>
            코드를 바꾸거나 &lsquo;사용&rsquo;을 꺼도, 이미 들어와 있는 기기는 최대 30일 동안 그대로
            유지됩니다. 새로 들어오는 것만 막힙니다.
          </li>
          <li>관리자는 조 코드와 상관없이 관리자 로그인으로 들어올 수 있습니다.</li>
          <li>퀴즈, 너시(Nursi)튜터, 이수 확인증은 조 코드와 별도로 학번과 PIN을 확인합니다.</li>
        </ul>

        {rows.map((row, idx) => {
          const login = row.id ? logins[row.id] : undefined;
          return (
            <div key={row.id ?? `new-${idx}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 sm:grid-cols-[8rem_1fr_auto_auto] sm:items-center">
                <input
                  value={row.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="조 이름 (예: 1조)"
                  className={inputClass}
                />
                <input
                  value={row.code}
                  onChange={(e) => update(idx, { code: e.target.value })}
                  placeholder="조 코드"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${inputClass} font-mono`}
                />
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => update(idx, { active: e.target.checked })}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  사용
                </label>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="justify-self-start rounded-md border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  삭제
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {login
                  ? `입장 ${login.count}회 · 최근 ${formatDate(login.lastAt)}`
                  : "아직 이 코드로 입장한 기록이 없습니다."}
              </p>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { name: `${prev.length + 1}조`, code: "", active: true }])}
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          + 조 추가
        </button>

        {error && <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            저장되었습니다. 입장 화면에 바로 반영됩니다.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "저장 중..." : "조 코드 저장"}
        </button>
      </div>
    </div>
  );
}
