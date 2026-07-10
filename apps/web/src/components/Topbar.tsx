"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Home, Menu, X, Zap } from "lucide-react";
import { clsx } from "clsx";
import { OpenWatchLogo } from "./OpenWatchLogo";

type NavItem = {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  exact?: boolean;
};

// Single global nav — sits inline with the logo (one bar, no second row).
const NAV: NavItem[] = [
  { href: "/", icon: Home, label: "Hoje", exact: true },
  { href: "/radar", icon: Zap, label: "Radar" },
  { href: "/coverage", icon: Activity, label: "Cobertura" },
  { href: "/methodology", icon: BookOpen, label: "Metodologia" },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  const p = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  return item.exact ? p === item.href : p.startsWith(item.href);
}

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="ow-topbar">
        <Link href="/" className="ow-topbar-logo" aria-label="OpenWatch — página inicial">
          <OpenWatchLogo size="sm" />
        </Link>

        {/* Inline nav — same row as the logo */}
        <nav className="ow-topbar-nav" aria-label="Navegação principal">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx("ow-tab-pill", active && "active")}
                aria-current={active ? "page" : undefined}
              >
                <item.icon size={14} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="ow-topbar-action sm:hidden ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav"
            className="fixed top-[var(--topbar-height)] left-0 right-0 z-50 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] sm:hidden animate-slide-up"
            aria-label="Menu móvel"
          >
            <div className="p-3 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx("ow-nav-item", active && "active")}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={14} className="ow-nav-icon" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
