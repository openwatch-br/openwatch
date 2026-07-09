import { SEVERITY_VAR, type SeismographTick } from "../helpers";

const SEV_LABEL: Record<string, string> = {
  low: "baixo",
  medium: "médio",
  high: "alto",
  critical: "crítico",
};

interface SeismographProps {
  ticks: SeismographTick[];
  /** Compact height for the mobile summary card. */
  compact?: boolean;
}

/**
 * Fita-radar — a CSS-only seismograph. Each bar is one day; height encodes the
 * volume of signals that emerged, color the day's peak severity. No charting
 * library: 30 bars is a flex row of spans. Purely presentational.
 */
export function Seismograph({ ticks, compact = false }: SeismographProps) {
  const maxCount = Math.max(1, ...ticks.map((t) => t.count));
  const minH = compact ? 3 : 4;
  const maxH = compact ? 46 : 72;

  return (
    <div
      className="relative flex items-end gap-[3px] rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-dark-2)] px-3"
      style={{ height: compact ? 52 : 88 }}
    >
      {/* baseline */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--color-border-subtle)]" />
      {ticks.map((t) => {
        const h = t.count > 0 ? minH + (t.count / maxCount) * (maxH - minH) : minH;
        const color = t.peak ? SEVERITY_VAR[t.peak] : "var(--color-border)";
        const title = t.peak
          ? `${t.date} · ${t.count} sinais · pico ${SEV_LABEL[t.peak]}`
          : `${t.date} · sem sinais`;
        return (
          <span
            key={t.date}
            title={title}
            className="min-w-0 flex-1 rounded-t-[1px]"
            style={{ height: h, background: color }}
          />
        );
      })}
    </div>
  );
}
