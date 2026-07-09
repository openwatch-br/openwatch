import { TYPOLOGY_LABELS } from "@/lib/constants";
import type { RadarV2TypologyCount } from "@/lib/types";

interface TypologyActivityRailProps {
  typologies: RadarV2TypologyCount[];
  loading: boolean;
}

/**
 * "Padrões mais ativos" — typologies with the most open signals, shown as a
 * mini-distribution (bar width relative to the busiest). Real counts from the
 * radar summary.
 */
export function TypologyActivityRail({ typologies, loading }: TypologyActivityRailProps) {
  const top = [...typologies].sort((a, b) => b.count - a.count).slice(0, 5);
  const max = Math.max(1, ...top.map((t) => t.count));

  return (
    <section>
      <h3 className="mb-1 font-display text-[15px] font-semibold text-[var(--color-text)]">
        Padrões mais ativos
      </h3>
      <p className="mb-3.5 text-[11.5px] leading-snug text-[var(--color-text-3)]">
        Tipologias com mais sinais abertos agora.
      </p>

      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="ow-skeleton h-7 rounded-md" />)
          : top.map((t) => (
              <div key={t.code} className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10.5px] text-[var(--color-text-3)]">{t.code}</span>
                  <span className="flex-1 truncate text-[12.5px] text-[var(--color-text-2)]">
                    {TYPOLOGY_LABELS[t.code] ?? t.name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-text)]">{t.count}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-brand)]"
                    style={{ width: `${(t.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
