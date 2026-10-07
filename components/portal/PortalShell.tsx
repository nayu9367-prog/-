"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { adminNavItem, navGroups, navItems } from "@/lib/nav-items";
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
  // Only ever true on a phone-sized screen, where the sidebar is a drawer
  // laid over the page; from the md breakpoint up it is always in view.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Closing by the close button, the backdrop or Escape hands focus back to
  // the button that opened the drawer. Following a link doesn't: the page
  // is changing anyway.
  const closeMenu = useCallback((returnFocus: boolean) => {
    setSidebarOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;

    // The page behind stays put while the drawer is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") closeMenu(true);
    }
    // Widening to the desktop layout (rotating a tablet, resizing a window)
    // must not leave the page locked behind a drawer that no longer exists.
    const desktop = window.matchMedia("(min-width: 768px)");
    function handleBreakpoint(event: MediaQueryListEvent) {
      if (event.matches) setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleBreakpoint);
    };
  }, [sidebarOpen, closeMenu]);

  // Tab cycles within the open drawer instead of wandering off it.
  function handleDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!sidebarOpen || event.key !== "Tab") return;
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const allItems = isAdmin ? [...navItems, adminNavItem] : navItems;
  const activeItem = allItems.find((item) => isActive(pathname, item.href));

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      <AnalyticsTracker />
      {/* Mobile Top Header */}
      <header
        inert={sidebarOpen}
        className="md:hidden bg-emerald-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
            <i className="fa-solid fa-user-nurse" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            NursiHub <span className="text-emerald-400 text-xs font-normal">지역사회</span>
          </span>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-200 hover:text-white"
          aria-label="메뉴 열기"
          aria-expanded={sidebarOpen}
          aria-controls="portal-menu"
        >
          <i className="fa-solid fa-bars text-xl" aria-hidden="true" />
        </button>
      </header>

      {/* Dims the page behind the open drawer; tapping it closes the drawer. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 md:hidden"
          onClick={() => closeMenu(true)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      {/* On a phone: a drawer fixed over the page, scrolling within itself,
          so opening it never moves the content behind. From md up: the
          sidebar beside the content. */}
      <aside
        id="portal-menu"
        ref={drawerRef}
        role={sidebarOpen ? "dialog" : undefined}
        aria-modal={sidebarOpen ? true : undefined}
        aria-label="메뉴"
        onKeyDown={handleDrawerKeyDown}
        className={`fixed inset-y-0 left-0 z-60 flex h-dvh w-72 max-w-[85vw] flex-col justify-between overflow-y-auto overscroll-contain bg-slate-900 text-white border-r border-slate-800 transition-[translate,visibility] duration-200 ${
          sidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        } md:visible md:static md:z-30 md:h-auto md:min-h-screen md:w-64 md:max-w-none md:translate-x-0 md:overflow-visible md:transition-none shrink-0`}
      >
        <div>
          <div className="md:hidden flex items-center justify-between border-b border-emerald-900/60 py-2 pl-5 pr-2">
            <span className="font-bold tracking-tight">
              NursiHub <span className="text-emerald-400 text-xs font-normal">메뉴</span>
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => closeMenu(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-200 hover:text-white"
              aria-label="메뉴 닫기"
            >
              <i className="fa-solid fa-xmark text-xl" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:flex p-5 border-b border-emerald-900/60 items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <i className="fa-solid fa-house-medical text-xl" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white">NursiHub</h1>
              <p className="text-[11px] text-emerald-400 font-medium">지역사회간호학 실습 포털</p>
            </div>
          </div>

          <nav className="px-3 py-4 space-y-3">
            {navGroups.map((group) => (
              <div key={group.label ?? "home"} className="space-y-1">
                {group.label && (
                  <p className="px-4 pt-1 text-[11px] font-bold text-emerald-400">{group.label}</p>
                )}
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`w-full min-h-11 flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
              </div>
            ))}
          </nav>

          {isAdmin && (
            <div className="px-3 pb-3">
              <Link
                href={adminNavItem.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive(pathname, adminNavItem.href) ? "page" : undefined}
                className={`w-full min-h-11 flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
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

        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-emerald-900 text-xs text-slate-400">
          <span>© 2026 NursiHub</span>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* min-w-0 lets wide content (tables, long words) scroll or wrap inside
          the page instead of stretching it sideways. */}
      <main
        inert={sidebarOpen}
        className="flex-1 min-w-0 overflow-y-auto md:min-h-screen custom-scrollbar"
      >
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-20 shadow-sm">
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
