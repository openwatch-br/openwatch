"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { severityColor } from "./dossieSeverity";

/**
 * Minimal editorial-prose primitives scoped to the dossiê reading column.
 * (The app-wide `.ow-prose` / typed-callout system is owned by a later story;
 * these are the local equivalents needed for the publication layout now.)
 */

/** Opening paragraph with a brand drop-cap on its first letter. */
export function DossieLede({ children }: { children: string }) {
  const first = children.charAt(0);
  const rest = children.slice(1);
  return (
    <p className="mb-6 font-sans text-[17px] leading-[1.7] text-secondary">
      <span
        className="float-left mr-3 mt-1.5 font-display text-[46px] font-bold leading-[0.82]"
        style={{ color: "var(--color-brand)" }}
        aria-hidden
      >
        {first}
      </span>
      {rest}
    </p>
  );
}

/** Section heading that doubles as a scroll-spy / TOC anchor target. */
export function DossieHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 scroll-mt-[calc(var(--shell-height)+16px)] font-display text-[26px] font-semibold leading-tight tracking-[-0.015em] text-primary"
    >
      {children}
    </h2>
  );
}

export function DossieParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-base leading-[1.7] text-secondary">{children}</p>;
}

/** Finding pull-quote with a brand rule and an optional source line. */
export function DossiePullQuote({
  children,
  source,
  severity,
}: {
  children: ReactNode;
  source?: ReactNode;
  severity?: string;
}) {
  return (
    <blockquote
      className="my-8 py-1.5 pl-5"
      style={{ borderLeft: `3px solid ${severity ? severityColor(severity) : "var(--color-brand)"}` }}
    >
      <p className="m-0 font-display text-[21px] font-medium leading-[1.4] tracking-[-0.01em] text-primary">
        {children}
      </p>
      {source && (
        <div className="mt-2.5 font-mono text-[11px] text-muted">{source}</div>
      )}
    </blockquote>
  );
}

/** Disclaimer / "indício" strip that heads the reading column. */
export function DossieCallout({
  children,
  glyph = "◈",
  className,
}: {
  children: ReactNode;
  glyph?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-9 flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3.5",
        className,
      )}
    >
      <span className="text-[13px] leading-[1.5] text-muted" aria-hidden>
        {glyph}
      </span>
      <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{children}</p>
    </div>
  );
}
