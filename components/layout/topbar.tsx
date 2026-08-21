"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BellIcon, MenuIcon, SearchIcon } from "@/components/layout/icons";
import { matchNavLink, navLinks } from "@/components/layout/nav-links";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const activeLink = navLinks.find((link) => matchNavLink(pathname, link.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="-ml-1.5 rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <h1 className="truncate text-lg font-semibold text-foreground">
        {activeLink?.label ?? "Academy OS"}
      </h1>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          aria-label="Search"
          className="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <UserButton />
      </div>
    </header>
  );
}
