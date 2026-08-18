"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, CloseIcon, LogoMarkIcon } from "@/components/layout/icons";
import { matchNavLink, navLinks } from "@/components/layout/nav-links";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white dark:lg:border-zinc-800 dark:lg:bg-zinc-900">
        <SidebarContent pathname={pathname} onNavigate={onClose} />
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-3 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <SidebarContent pathname={pathname} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <LogoMarkIcon className="h-8 w-8 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Academy OS
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            Your Academy
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mx-3 mt-3 flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
      >
        <span className="truncate">Your Academy</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-zinc-400" />
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const active = matchNavLink(pathname, link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
            A
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Admin User
            </span>
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
              admin@academy.os
            </span>
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}
