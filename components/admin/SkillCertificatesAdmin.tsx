"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { SkillCertificate } from "@/lib/skillCertificates";

export default function SkillCertificatesAdmin({
  initialCertificates,
}: {
  initialCertificates: SkillCertificate[];
}) {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDelete(studentId: string) {
    if (!window.confirm(`학번 ${studentId}의 이수 확인증을 삭제하시겠습니까? 되돌릴 수 없습니다.`)) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/skill-certificate?${new URLSearchParams({ studentId })}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      setCertificates((prev) => prev.filter((c) => c.studentId !== studentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="font-bold text-slate-800 text-sm">
        <i className="fa-solid fa-award mr-1.5 text-emerald-600" />
        핵심술기 동영상 이수 확인증 ({certificates.length}명)
      </h3>
      <p className="text-xs leading-relaxed text-slate-500">
        영상을 모두 90% 이상 재생하고 이수 확인증을 받은 학생입니다. 시청 기록은 학생의 기기에서 재생
        시간을 세어 만든 것이라, 영상을 틀어 둔 것까지만 확인됩니다.
      </p>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      {certificates.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">아직 이수 확인증을 받은 학생이 없습니다.</p>
      ) : (
        <ul className="flex max-h-96 flex-col gap-1.5 overflow-y-auto custom-scrollbar">
          {certificates.map((certificate) => (
            <li
              key={certificate.studentId}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600"
            >
              <span className="font-semibold text-slate-800">학번 {certificate.studentId}</span>
              <span className="flex-1 text-right text-slate-500">
                영상 {certificate.skills.length}개 · {formatDate(certificate.issuedAt)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(certificate.studentId)}
                disabled={busy}
                className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
