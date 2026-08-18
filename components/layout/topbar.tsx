"use client";

import { usePathname } from "next/navigation";
import { BellIcon, MenuIcon, SearchIcon } from "@/components/layout/icons";
import { matchNavLink, navLinks } from "@/components/layout/nav-links";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const activeLink = navLinks.find((link) => matchNavLink(pathname, link.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/80 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="-ml-1.5 rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {activeLink?.label ?? "Academy OS"}
      </h1>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          aria-label="Search"
          className="hidden rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 sm:inline-flex"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white lg:hidden">
          A
        </span>
      </div>
    </header>
  );
}
