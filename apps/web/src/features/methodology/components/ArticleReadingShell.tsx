"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface ArticleTocEntry {
  num: string;
  id: string;
  label: string;
}

interface ArticleReadingShellProps {
  eyebrow: string;
  docVersion: string;
  docRevisedAt: string;
  toc: ArticleTocEntry[];
  children: ReactNode;
}

/**
 * The long-form "editorial document" chassis shared by Metodologia and
 * Compliance: a sticky, scroll-spy table of contents rail beside a narrow
 * (.ow-prose, 68ch) reading column. Mirrors the scroll-spy IntersectionObserver
 * pattern from `features/dossie/components/DossieReadingShell.tsx` (owned by
 * S5a) rather than reinventing it — same "long-form reading experience"
 * concept, but built fresh here because dossiê's shell is coupled to
 * dossiê-specific meta (caseId, severity-colored TOC markers, provenance
 * footer) that doesn't apply to a static reference document.
 */
export function ArticleReadingShell({
  eyebrow,
  docVersion,
  docRevisedAt,
  toc,
  children,
}: ArticleReadingShellProps) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el != null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-0 md:grid-cols-[248px_minmax(0,1fr)]">
      {/* ── anchored TOC ─────────────────────────────────────────── */}
      <aside className="hidden border-r border-[var(--color-border-subtle)] px-6 py-8 md:block">
        <div className="sticky top-[calc(var(--shell-height)+24px)] flex flex-col gap-5">
          <div>
            <p className="text-mono-xs uppercase tracking-[0.14em]" style={{ color: "var(--color-text-3)" }}>
              {eyebrow}
            </p>
            <p className="text-mono-xs mt-1" style={{ color: "var(--color-text-3)" }}>
              {docVersion} · rev. {docRevisedAt}
            </p>
          </div>

          <nav className="flex flex-col gap-0.5">
            <p className="mb-1.5 text-label" style={{ color: "var(--color-text-3)" }}>
              Nesta página
            </p>
            {toc.map((entry) => {
              const isActive = activeId === entry.id;
              return (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  className="flex items-center gap-2.5 rounded-md py-[7px] pl-2.5 pr-2 transition-colors hover:bg-[var(--color-surface)]"
                  style={{
                    background: isActive ? "var(--color-brand-tint)" : "transparent",
                    borderLeft: `2px solid ${isActive ? "var(--color-brand)" : "transparent"}`,
                  }}
                >
                  <span className="text-mono-xs w-4 shrink-0" style={{ color: "var(--color-text-3)" }}>
                    {entry.num}
                  </span>
                  <span
                    className="flex-1 text-[12.5px] leading-tight"
                    style={{ color: isActive ? "var(--color-text)" : "var(--color-text-2)" }}
                  >
                    {entry.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── reading column ───────────────────────────────────────── */}
      <div className="px-5 py-8 sm:px-8 md:py-14">
        <article className="ow-prose mx-auto">{children}</article>
      </div>
    </div>
  );
}
