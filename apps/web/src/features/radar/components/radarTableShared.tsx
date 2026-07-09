import { cn } from "@/lib/utils";
import type { SignalSeverity } from "@/lib/types";

export const PAGE_SIZE = 20;

export const SEV_LABEL: Record<SignalSeverity, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

/** Shared grid templates so header and rows stay column-aligned. */
export const CASES_GRID = "sm:grid-cols-[34px_1fr_150px_130px_130px_110px]";
export const SIGNALS_GRID = "sm:grid-cols-[34px_1fr_150px_150px_120px]";

export interface TableColumn {
  label: string;
  align?: "right";
  accent?: boolean;
}

/**
 * Desktop-only column header for a radar results table. Hidden on mobile,
 * where rows render as stacked cards.
 */
export function RadarTableHeader({ columns, grid }: { columns: TableColumn[]; grid: string }) {
  return (
    <div
      className={cn(
        "hidden h-[38px] items-center border-b border-[var(--color-border)] bg-[var(--color-surface-dark-2)] px-5 sm:grid",
        grid,
      )}
    >
      {columns.map((c, i) => (
        <span
          key={`col-${i}`}
          className={cn(
            "font-ui text-[11px] font-semibold uppercase tracking-[0.1em]",
            c.accent ? "text-[var(--color-brand-text)]" : "text-[var(--color-text-3)]",
            c.align === "right" && "text-right",
          )}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}
