"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/admin";

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between">
      {isHome ? (
        <p className="text-sm text-slate-500">관리할 항목을 선택하세요.</p>
      ) : (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
        >
          <i className="fa-solid fa-arrow-left" /> 관리자 제어 센터로
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        로그아웃
      </button>
    </div>
  );
}
