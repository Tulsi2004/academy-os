"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/layout/brand";
import { CloseIcon } from "@/components/layout/icons";
import { matchNavLink, navLinks } from "@/components/layout/nav-links";
import { useLanguage } from "@/lib/i18n/language-provider";
import { fill } from "@/lib/i18n/format";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
  organizationName: string;
  userName: string;
  userEmail: string;
};

export function Sidebar({
  mobileOpen,
  onClose,
  organizationName,
  userName,
  userEmail,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const closeLabel = t.nav.closeMenu;

  const content = (
    <SidebarContent
      pathname={pathname}
      onNavigate={onClose}
      organizationName={organizationName}
      userName={userName}
      userEmail={userEmail}
    />
  );

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        {content}
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
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          {content}
        </aside>
      </div>
    </>
  );
}

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function SidebarContent({
  pathname,
  onNavigate,
  organizationName,
  userName,
  userEmail,
}: {
  pathname: string;
  onNavigate: () => void;
  organizationName: string;
  userName: string;
  userEmail: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
        <BrandLockup />
      </div>

      {/*
        Static rather than a switcher: a user belongs to exactly one academy, so
        there is nothing to switch to. It becomes a control when it can act.
      */}
      <div className="mx-3 mt-3 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
        <span className="block truncate" title={organizationName}>
          {organizationName}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const active = matchNavLink(pathname, link.href);
            const Icon = link.icon;
            const label = t.nav[link.labelKey];
            const row = (
              <>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {link.comingSoon && (
                  <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                    {t.nav.soon}
                  </span>
                )}
              </>
            );

            // Modules that aren't built yet render as inert rows rather than
            // links — clicking through to an empty placeholder reads as a bug.
            if (link.comingSoon) {
              return (
                <li key={link.href}>
                  <span
                    aria-disabled="true"
                    title={fill(t.nav.comingSoon, { label })}
                    className="flex cursor-not-allowed select-none items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
                  >
                    {row}
                  </span>
                </li>
              );
            }

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {row}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Account actions live on the topbar's Clerk UserButton, so this is a
          read-only identity strip. */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initialOf(userName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground" title={userName}>
              {userName}
            </span>
            <span className="block truncate text-xs text-muted-foreground" title={userEmail}>
              {userEmail}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
