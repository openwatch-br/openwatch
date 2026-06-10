import type { ReactNode } from "react";

type StatTone = "critical" | "neutral" | "brand";

const TONE_COLORS: Record<StatTone, string> = {
  critical: "var(--color-critical)",
  neutral: "var(--color-text)",
  brand: "var(--color-brand)",
};

export interface StatHeroStat {
  value: string;
  label: string;
  tone?: StatTone;
}

interface StatHeroProps {
  /** Uppercase tracked eyebrow, e.g. "SINAIS DE RISCO DETECTADOS" */
  label: string;
  /** Huge mono number */
  value: string;
  /** Muted line under the value */
  subtitle?: string;
  /** Row of secondary stats (big number + tiny uppercase label) */
  stats?: StatHeroStat[];
  /** Optional extra content (e.g. actions) rendered top-right */
  actions?: ReactNode;
}

export function StatHero({ label, value, subtitle, stats, actions }: StatHeroProps) {
  return (
    <section className="mb-6 pb-6 border-b border-[var(--color-border)] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-label flex items-center gap-2 text-[var(--color-brand)]">
          <span aria-hidden="true" className="inline-block w-5 h-px bg-[var(--color-brand)]" />
          {label}
        </span>
        {actions}
      </div>

      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div className="space-y-2">
          <div className="text-stat text-[var(--color-text)]">{value}</div>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-2)]">{subtitle}</p>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-x-0 gap-y-3 pb-1">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-0.5 px-6 first:pl-0 border-l first:border-l-0 border-[var(--color-border)]"
              >
                <span
                  className="font-mono text-xl font-bold tabular-nums leading-none"
                  style={{ color: TONE_COLORS[s.tone ?? "neutral"] }}
                >
                  {s.value}
                </span>
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-3)]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
