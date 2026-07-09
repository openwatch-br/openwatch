"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface DossieEmbedFrameProps {
  label: string;
  /** Optional right-aligned action (e.g. "abrir na Rede"). */
  action?: { href: string; label: string };
  /** When true the label/action sit in a bordered header strip (graph); when
   *  false the label floats above the padded body (timeline). */
  headerBar?: boolean;
  children: ReactNode;
  bodyClassName?: string;
}

/** Bordered card that hosts a timeline or graph inside the reading flow. */
export function DossieEmbedFrame({
  label,
  action,
  headerBar = false,
  children,
  bodyClassName,
}: DossieEmbedFrameProps) {
  const labelEl = (
    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
      {label}
    </span>
  );
  const actionEl = action ? (
    <Link href={action.href} className="text-xs text-brand-text hover:opacity-80">
      {action.label}
    </Link>
  ) : null;

  return (
    <div className="my-7 overflow-hidden rounded-lg border border-border-subtle bg-surface-subtle">
      {headerBar ? (
        <div className="flex items-center justify-between border-b border-border-subtle px-[18px] py-3">
          {labelEl}
          {actionEl}
        </div>
      ) : null}
      <div className={bodyClassName ?? "px-6 py-5"}>
        {!headerBar && (
          <div className="mb-4 flex items-center justify-between">
            {labelEl}
            {actionEl}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
