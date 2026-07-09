"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { OpenWatchLogo } from "./OpenWatchLogo";
import { ThemeToggle } from "./ThemeToggle";

const MOBILE_NAV = [
  { href: "/radar", label: "Radar de Risco" },
  { href: "/coverage", label: "Cobertura" },
  { href: "/methodology", label: "Metodologia" },
  { href: "/compliance", label: "Conformidade" },
  { href: "/api-health", label: "Status da API" },
];

function triggerCmdK() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
  );
}

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="ow-topbar">
        {/* Brand */}
        <Link href="/" className="ow-topbar-logo" aria-label="OpenWatch — página inicial">
          <OpenWatchLogo size="sm" />
        </Link>

        {/* Global search — opens command palette */}
        <button
          type="button"
          className="ow-topbar-search hidden sm:flex"
          onClick={triggerCmdK}
          aria-label="Buscar empresa, pessoa, órgão ou CNPJ (⌘K)"
        >
          <Search size={14} aria-hidden="true" className="text-[var(--color-text-3)]" />
          <span className="ow-topbar-search-placeholder">
            empresa, pessoa, órgão ou CNPJ…
          </span>
        </button>

        {/* Hint */}
        <span className="hidden lg:flex items-center gap-2 pr-4 pl-2 text-xs text-[var(--color-text-3)] whitespace-nowrap">
          Enter busca
          <kbd className="text-[0.625rem] opacity-50 border border-[var(--color-border)] rounded px-1 py-0.5 font-mono">
            ⌘K
          </kbd>
        </span>

        {/* Theme toggle */}
        <ThemeToggle collapsed className="hidden sm:flex ow-topbar-action" />

        {/* Mobile hamburger */}
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

      {/* Mobile drawer */}
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
              {/* Search */}
              <button
                className="ow-nav-item"
                onClick={() => { setMobileOpen(false); triggerCmdK(); }}
              >
                <Search size={14} className="ow-nav-icon" />
                Buscar...
                <kbd className="ml-auto text-[0.625rem] opacity-40 border border-[var(--color-border)] rounded px-1 py-0.5 font-mono">
                  ⌘K
                </kbd>
              </button>

              <div className="h-px bg-[var(--color-border)] my-1" />

              {MOBILE_NAV.map((item) => {
                const isActive =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx("ow-nav-item", isActive && "active")}
                    onClick={() => setMobileOpen(false)}
                  >
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
