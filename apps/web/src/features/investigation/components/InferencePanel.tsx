"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Forensic "inference panel" — the persistent memorando that structures how a
 * signal was reasoned about, in three obligatory fields:
 *   1. data     → what the data shows (factual)
 *   2. indicate → what it may indicate (legal hypothesis, shown as support)
 *   3. negate   → what it does NOT assert (the disclaimer, promoted to a field)
 * Plus a confidence score with corroboration thresholds.
 *
 * Kept data-shape-agnostic (callers pass rendered `body` + `refs`) so both the
 * nav-linked SinalPage and the legacy SignalDetailPage can share one panel.
 */

export type InferenceTone = "data" | "indicate" | "negate";

export interface InferenceField {
  label: string;
  tone: InferenceTone;
  body: ReactNode;
  /** Optional mono reference chips (e.g. legal norms). */
  refs?: string[];
}

const TONE: Record<InferenceTone, { bg: string; color: string }> = {
  data: { bg: "var(--color-brand-tint)", color: "var(--color-brand-text)" },
  indicate: { bg: "var(--color-medium-bg)", color: "var(--color-medium)" },
  negate: { bg: "var(--color-critical-bg)", color: "var(--color-critical)" },
};

interface InferencePanelProps {
  title?: string;
  subtitle?: string;
  fields: InferenceField[];
  /** 0–100 confidence score; null when the signal carries no confidence data. */
  score: number | null;
  scoreNote?: string;
  className?: string;
}

export function InferencePanel({
  title = "Painel de inferência",
  subtitle = "Como o OpenWatch chegou a este indício — e seus limites.",
  fields,
  score,
  scoreNote,
  className,
}: InferencePanelProps) {
  const clamped = score != null ? Math.max(0, Math.min(100, score)) : null;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface-card",
        className,
      )}
    >
      <div className="border-b border-border-subtle bg-surface-subtle px-5 py-4">
        <p className="font-display text-base font-semibold text-primary">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-muted">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {fields.map((field, i) => {
          const tone = TONE[field.tone];
          return (
            <div key={field.label}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[11px] font-semibold"
                  style={{ background: tone.bg, color: tone.color }}
                >
                  {i + 1}
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-secondary">
                  {field.label}
                </span>
              </div>
              <p className="m-0 text-[13.5px] leading-[1.6] text-secondary">{field.body}</p>
              {field.refs && field.refs.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {field.refs.map((ref) => (
                    <span
                      key={ref}
                      className="rounded border border-border px-2 py-0.5 font-mono text-[10.5px] text-secondary"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {clamped != null && (
          <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Score de confiança</span>
              <span className="font-mono text-[13px] font-semibold text-primary tabular-nums">
                {clamped} / 100
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-border-subtle">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${clamped}%`, background: "var(--color-brand)" }}
              />
              {[60, 80, 95].map((t) => (
                <div
                  key={t}
                  className="absolute -top-[3px] -bottom-[3px] w-px bg-border-strong"
                  style={{ left: `${t}%` }}
                />
              ))}
            </div>
            {scoreNote && (
              <p className="m-0 font-mono text-[10px] text-muted">{scoreNote}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
