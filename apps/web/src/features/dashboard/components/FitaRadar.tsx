import { formatNumber } from "@/lib/utils";
import { Seismograph } from "./Seismograph";
import type { SeismographTick } from "../helpers";

interface StatCallout {
  value: string;
  label: string;
  tone: "critical" | "high" | "neutral";
}

interface FitaRadarProps {
  totalSignals: number;
  recent7: number;
  ticks: SeismographTick[];
  stats: StatCallout[];
  days: number;
}

const TONE_COLOR: Record<StatCallout["tone"], string> = {
  critical: "var(--color-critical)",
  high: "var(--color-high)",
  neutral: "var(--color-text-2)",
};

function axisLabels(ticks: SeismographTick[]): string[] {
  if (ticks.length === 0) return [];
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const idxs = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.min(ticks.length - 1, Math.round(f * (ticks.length - 1))));
  return idxs.map((i, n) => {
    const tick = ticks[i];
    if (!tick) return "";
    return n === idxs.length - 1 ? `hoje · ${fmt(tick.date)}` : fmt(tick.date);
  });
}

/**
 * The home hero: the fita-radar seismograph framed by the live signal count,
 * a 7-day delta, and severity/volume callouts. Presentational — data arrives
 * pre-aggregated. This is the "monitoring instrument, not number panel" thesis.
 */
export function FitaRadar({ totalSignals, recent7, ticks, stats, days }: FitaRadarProps) {
  const labels = axisLabels(ticks);

  return (
    <section className="border-b border-[var(--color-border-subtle)] px-4 pb-6 pt-7 sm:px-8">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-3)] sm:text-xs">
            Fita-radar · emergência de sinais · últimos {days} dias
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <span className="font-display text-2xl font-bold leading-none tracking-tight text-[var(--color-text)] sm:text-3xl">
              {formatNumber(totalSignals)} sinais ativos
            </span>
            {recent7 > 0 && (
              <span className="font-mono text-xs text-[var(--color-success)]">
                ▲ {formatNumber(recent7)} nos últimos 7 dias
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4 sm:gap-5">
              {i > 0 && <span className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />}
              <div className="text-left sm:text-right">
                <div
                  className="font-display text-xl font-bold leading-none sm:text-[22px]"
                  style={{ color: TONE_COLOR[s.tone] }}
                >
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-3)]">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Seismograph ticks={ticks} />

      {labels.length > 0 && (
        <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--color-text-3)]">
          {labels.map((l, i) => (
            <span key={i} className={i === labels.length - 1 ? "text-[var(--color-text-2)]" : undefined}>
              {l}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
