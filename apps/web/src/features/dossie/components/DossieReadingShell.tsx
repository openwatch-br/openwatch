"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { severityColor } from "./dossieSeverity";

export type TocEntry =
  | { kind: "anchor"; num: string; label: string; id: string; severity?: string }
  | { kind: "route"; num: string; label: string; href: string; active?: boolean; severity?: string };

export interface DossieRailMeta {
  dossieNumber: string;
  caseId: string;
  provenanceOk: boolean;
  evidenceCount: number;
  sourceCount: number;
  readingMinutes: number;
}

interface DossieReadingShellProps {
  meta: DossieRailMeta;
  toc: TocEntry[];
  children: ReactNode;
  /** Enable scroll-spy over anchor entries (overview page only). */
  scrollSpy?: boolean;
}

/**
 * The dossiê "publication" chassis: a sticky table-of-contents rail that tracks
 * the reading position, and a narrow editorial reading column. Chapter pages
 * pass route entries (current chapter marked active); the overview passes
 * anchor entries and enables scroll-spy.
 */
export function DossieReadingShell({
  meta,
  toc,
  children,
  scrollSpy = false,
}: DossieReadingShellProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!scrollSpy) return;
    const ids = toc.filter((t) => t.kind === "anchor").map((t) => (t as { id: string }).id);
    const els = ids
      .map((id) => document.getElementById(id))
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
  }, [scrollSpy, toc]);

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-0 md:grid-cols-[248px_minmax(0,1fr)]">
      {/* ── TOC rail ─────────────────────────────────────────────── */}
      <aside className="hidden border-r border-border-subtle px-6 py-8 md:block">
        <div className="sticky top-[calc(var(--shell-height)+24px)] flex flex-col gap-6">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
              {meta.dossieNumber}
            </p>
            <p className="mt-1.5 font-mono text-[10.5px] text-muted">{meta.caseId}</p>
          </div>

          <nav className="flex flex-col gap-0.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Sumário
            </p>
            {toc.map((entry) => {
              const isActive =
                entry.kind === "anchor"
                  ? activeId === entry.id
                  : Boolean(entry.active);
              const marker = entry.severity
                ? severityColor(entry.severity)
                : "var(--color-brand)";
              const content = (
                <span
                  className="flex items-center gap-2.5 rounded-md py-[7px] pl-2.5 pr-2 transition-colors"
                  style={{
                    background: isActive ? "var(--color-brand-tint)" : "transparent",
                    borderLeft: `2px solid ${isActive ? marker : "transparent"}`,
                  }}
                >
                  <span className="w-3.5 shrink-0 font-mono text-[10.5px] text-muted">
                    {entry.num}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[12.5px] leading-tight",
                      isActive ? "text-primary" : "text-secondary",
                    )}
                  >
                    {entry.label}
                  </span>
                </span>
              );
              return entry.kind === "anchor" ? (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  className="block hover:[&>span]:bg-surface-subtle"
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="block hover:[&>span]:bg-surface-subtle"
                >
                  {content}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-4">
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[10.5px]"
              style={{ color: meta.provenanceOk ? "var(--color-success)" : "var(--color-text-3)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: meta.provenanceOk ? "var(--color-success)" : "var(--color-text-3)" }}
              />
              {meta.provenanceOk ? "proveniência íntegra" : "proveniência parcial"}
            </span>
            <span className="font-mono text-[10.5px] text-muted">
              {meta.evidenceCount} evidências · {meta.sourceCount} fontes
            </span>
            <span className="font-mono text-[10.5px] text-muted">
              leitura ≈ {meta.readingMinutes} min
            </span>
          </div>
        </div>
      </aside>

      {/* ── reading column ───────────────────────────────────────── */}
      <div className="px-5 py-8 sm:px-8 md:py-12">
        <article className="mx-auto max-w-[680px]">{children}</article>
      </div>
    </div>
  );
}
