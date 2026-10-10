"use client";

import Link from "next/link";
import { useState } from "react";
import StudentGate from "@/components/StudentGate";
import { formatDate } from "@/lib/format";
import type { SkillCertificate } from "@/lib/skillCertificates";
import { loadWatchState, watchKey, watchPercent, type WatchState } from "@/lib/skillWatch";

type SkillSummary = { id: string; title: string; videoId: string };

export default function SkillCertificateView({ skills }: { skills: SkillSummary[] }) {
  // Null until the student has confirmed their ID and PIN.
  const [studentId, setStudentId] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<SkillCertificate | null>(null);
  const [watch, setWatch] = useState<WatchState>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleReady(confirmedId: string) {
    setStudentId(confirmedId);
    setWatch(loadWatchState());
    setLoading(true);
    try {
      const response = await fetch("/api/skill-certificate");
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.certificate) setCertificate(data.certificate);
    } catch {
      // Not knowing is fine: the student can still be issued one below.
    } finally {
      setLoading(false);
    }
  }

  async function handleIssue() {
    setError("");
    setBusy(true);
    try {
      const watched = skills.map(watchKey).filter((key) => watch[key]?.done);
      const response = await fetch("/api/skill-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "이수 확인증을 만들지 못했습니다.");
      setCertificate(data.certificate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이수 확인증을 만들지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!studentId) {
    return (
      <StudentGate
        title="학번을 확인하고 이수 확인증을 받으세요"
        description="이수 확인증은 학번과 함께 저장되어 담당 교수님도 확인할 수 있습니다."
        startLabel="이수 확인증 보기"
        onReady={handleReady}
      />
    );
  }

  if (loading) return null;

  if (certificate) {
    return (
      <div className="space-y-5">
        <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border-4 border-double border-emerald-700 bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-xs font-bold tracking-widest text-emerald-700">
            NursiHub · 지역사회간호학 실습 포털
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">핵심술기 동영상 이수 확인증</h3>
          <p className="text-lg text-slate-800">
            학번 <strong className="text-2xl font-extrabold">{certificate.studentId}</strong>
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            위 학생은 아래 핵심술기 동영상 {certificate.skills.length}개를 모두 시청하였음을 확인합니다.
          </p>
          <ul className="mx-auto max-w-md space-y-2 text-left">
            {certificate.skills.map((title) => (
              <li
                key={title}
                className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-slate-800"
              >
                <i className="fa-solid fa-circle-check mt-0.5 text-emerald-600" />
                <span>{title}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">확인일 {formatDate(certificate.issuedAt)}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-emerald-500"
          >
            <i className="fa-solid fa-print mr-1.5" /> 인쇄·PDF로 저장
          </button>
          <Link
            href="/skills"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100"
          >
            영상 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const doneCount = skills.filter((skill) => watch[watchKey(skill)]?.done).length;
  const allDone = skills.length > 0 && doneCount === skills.length;

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">
        <i className="fa-solid fa-award mr-1.5 text-emerald-600" />
        {allDone ? "영상을 모두 시청했습니다" : `영상 ${skills.length}개 중 ${doneCount}개 시청 완료`}
      </h3>
      <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
        이수 확인증에 적힐 학번: <strong className="text-base font-extrabold">{studentId}</strong>
      </p>
      <p className="text-sm leading-relaxed text-slate-500">
        {allDone
          ? "아래 버튼을 누르면 위 학번이 적힌 이수 확인증이 만들어집니다."
          : "영상을 모두 시청하면 위 학번으로 이수 확인증을 받을 수 있습니다. 시청 기록은 영상을 본 기기에 저장되므로, 같은 기기에서 이어서 시청해 주세요."}
      </p>
      <ul className="space-y-2">
        {skills.map((skill) => {
          const percent = watchPercent(watch[watchKey(skill)]);
          return (
            <li
              key={skill.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm"
            >
              <span className="font-semibold text-slate-800">{skill.title}</span>
              {percent >= 100 ? (
                <span className="shrink-0 font-bold text-emerald-600">
                  <i className="fa-solid fa-circle-check" /> 시청 완료
                </span>
              ) : (
                <span className="shrink-0 font-semibold text-slate-500">시청 {percent}%</span>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}
      {allDone ? (
        <button
          type="button"
          onClick={handleIssue}
          disabled={busy}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "만드는 중..." : "이수 확인증 받기"}
        </button>
      ) : (
        <Link
          href="/skills"
          className="inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-emerald-500"
        >
          영상 보러 가기 &rarr;
        </Link>
      )}
    </div>
  );
}
