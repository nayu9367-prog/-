"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { loadSavedStudentId, saveStudentId } from "@/lib/studentId";

// "resume": this browser is already signed in as a student.
// "id": ask for the student ID. "pin": that ID has a PIN, ask for it.
// "new-pin": first use of that ID, have the student choose a PIN.
type Step = "loading" | "resume" | "id" | "pin" | "new-pin";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-center outline-none focus:border-emerald-500";
const primaryButtonClass =
  "w-full min-h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Confirms who the student is (student ID + PIN) before a feature that
 * records under their ID. Calls `onReady` with the confirmed student ID.
 */
export default function StudentGate({
  title,
  description,
  startLabel,
  notice,
  onReady,
}: {
  title: string;
  description: string;
  startLabel: string;
  notice?: ReactNode;
  onReady: (studentId: string) => void;
}) {
  const [step, setStep] = useState<Step>("loading");
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/student-session")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (typeof data?.studentId === "string" && data.studentId) {
          setStudentId(data.studentId);
          setStep("resume");
        } else {
          setStudentId(loadSavedStudentId());
          setStep("id");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStudentId(loadSavedStudentId());
        setStep("id");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function post(body: Record<string, string>) {
    const response = await fetch("/api/student-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "확인에 실패했습니다.");
    return data;
  }

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "확인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function handleIdSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = studentId.trim();
    if (!trimmed) return;
    run(async () => {
      const data = await post({ studentId: trimmed });
      setStudentId(trimmed);
      setPin("");
      setPinConfirm("");
      setStep(data.registered ? "pin" : "new-pin");
    });
  }

  function handlePinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "new-pin" && pin !== pinConfirm) {
      setError("두 번 입력한 PIN이 서로 다릅니다.");
      return;
    }
    run(async () => {
      const data = await post({ studentId, pin });
      saveStudentId(data.studentId);
      onReady(data.studentId);
    });
  }

  function handleSwitchStudent() {
    run(async () => {
      await fetch("/api/student-session", { method: "DELETE" });
      setStudentId("");
      setPin("");
      setPinConfirm("");
      setStep("id");
    });
  }

  if (step === "loading") return null;

  const isPinValid = /^\d{4}$/.test(pin);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 max-w-md mx-auto text-center">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      {notice}

      {step === "resume" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            학번 <b>{studentId}</b>(으)로 확인되어 있습니다.
          </p>
          {error && (
            <p role="alert" className="rounded-md bg-rose-50 px-4 py-2 text-xs text-rose-600">
              {error}
            </p>
          )}
          <button onClick={() => onReady(studentId)} disabled={busy} className={primaryButtonClass}>
            {startLabel}
          </button>
          <button
            onClick={handleSwitchStudent}
            disabled={busy}
            className="min-h-11 px-3 text-xs font-semibold text-slate-500 hover:underline disabled:opacity-50"
          >
            다른 학번으로 바꾸기
          </button>
        </div>
      )}

      {step === "id" && (
        <form onSubmit={handleIdSubmit} className="space-y-3">
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="학번 (예: 20231234)"
            maxLength={30}
            autoFocus
            aria-label="학번"
            aria-invalid={error ? true : undefined}
            className={inputClass}
          />
          {error && (
            <p role="alert" className="rounded-md bg-rose-50 px-4 py-2 text-xs text-rose-600">
              {error}
            </p>
          )}
          <button type="submit" disabled={!studentId.trim() || busy} className={primaryButtonClass}>
            {busy ? "확인 중..." : "다음"}
          </button>
        </form>
      )}

      {(step === "pin" || step === "new-pin") && (
        <form onSubmit={handlePinSubmit} className="space-y-3">
          <p className="text-sm text-slate-700">
            학번 <b>{studentId}</b>
          </p>
          {step === "new-pin" && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-800">
              처음 사용하는 학번입니다. 내 기록을 지킬 <b>숫자 4자리 PIN</b>을 정해 주세요. 다음부터는
              학번과 이 PIN을 함께 입력합니다. PIN을 잊으면 교수님께 초기화를 요청해야 합니다.
            </p>
          )}
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder={step === "new-pin" ? "새 PIN (숫자 4자리)" : "PIN (숫자 4자리)"}
            autoFocus
            aria-label={step === "new-pin" ? "새 PIN (숫자 4자리)" : "PIN (숫자 4자리)"}
            aria-invalid={error ? true : undefined}
            className={inputClass}
          />
          {step === "new-pin" && (
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="새 PIN 한 번 더"
              aria-label="새 PIN 한 번 더"
              className={inputClass}
            />
          )}
          {error && (
            <p role="alert" className="rounded-md bg-rose-50 px-4 py-2 text-xs text-rose-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!isPinValid || (step === "new-pin" && pinConfirm.length !== 4) || busy}
            className={primaryButtonClass}
          >
            {busy ? "확인 중..." : startLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep("id");
            }}
            disabled={busy}
            className="min-h-11 px-3 text-xs font-semibold text-slate-500 hover:underline disabled:opacity-50"
          >
            학번 다시 입력
          </button>
        </form>
      )}
    </div>
  );
}
