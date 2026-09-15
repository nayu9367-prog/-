"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { adminNavItem, navItems } from "@/lib/nav-items";
import AnalyticsTracker from "@/components/portal/AnalyticsTracker";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalShell({
  children,
  isAdmin,
}: {
  children: ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = isAdmin ? [...navItems, adminNavItem] : navItems;
  const activeItem = allItems.find((item) => isActive(pathname, item.href));

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AnalyticsTracker />
      {/* Mobile Top Header */}
      <header className="md:hidden bg-emerald-950 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
            <i className="fa-solid fa-user-nurse" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            NursiHub <span className="text-emerald-400 text-xs font-normal">지역사회</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="text-slate-200 hover:text-white p-2"
          aria-label="메뉴 열기"
        >
          <i className="fa-solid fa-bars text-xl" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-slate-900 text-white flex-col justify-between ${
          sidebarOpen ? "flex" : "hidden"
        } md:flex min-h-screen border-r border-slate-800 z-30 shrink-0`}
      >
        <div>
          <div className="hidden md:flex p-5 border-b border-emerald-900/60 items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <i className="fa-solid fa-house-medical text-xl" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white">NursiHub</h1>
              <p className="text-[11px] text-emerald-400 font-medium">지역사회간호학 실습 포털</p>
            </div>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-300 hover:bg-emerald-900/50 hover:text-white"
                  }`}
                >
                  <i className={`${item.icon} w-5`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="px-3 pb-3">
              <Link
                href={adminNavItem.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  isActive(pathname, adminNavItem.href)
                    ? "text-amber-300 bg-amber-950/60 border-amber-500/40"
                    : "text-amber-300/80 bg-amber-950/30 border-amber-500/20 hover:bg-amber-900/40"
                }`}
              >
                <i className={`${adminNavItem.icon} w-5 text-amber-400`} />
                <span>{adminNavItem.label}</span>
                <span className="ml-auto bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </Link>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-emerald-900 text-xs text-slate-400">
          <span>© 2026 NursiHub</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen custom-scrollbar">
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {activeItem && <i className={`${activeItem.icon} text-emerald-600`} />}
            {activeItem?.label ?? "NursiHub"}
          </h2>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
