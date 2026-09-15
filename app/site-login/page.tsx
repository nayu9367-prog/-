"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function isSafeNextPath(value: string | null): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

function SiteLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/site-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "입장에 실패했습니다.");
      }

      const next = searchParams.get("next");
      router.replace(isSafeNextPath(next) ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "입장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12 min-h-screen">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
          <i className="fa-solid fa-house-medical text-2xl" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">NursiHub 실습 포털 입장</h1>
        <p className="mt-1 text-sm text-slate-500">
          담당 교수님께 전달받은 입장 비밀번호를 입력해주세요.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          입장 비밀번호
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "확인 중..." : "입장하기"}
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>
    </main>
  );
}

export default function SiteLoginPage() {
  return (
    <Suspense>
      <SiteLoginForm />
    </Suspense>
  );
}
