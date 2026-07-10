import { StatusDot } from "@/components/StatusDot";
import type { CoverageV2SourceItem } from "@/lib/types";

interface HealthSummaryStripProps {
  sources: CoverageV2SourceItem[];
  loading: boolean;
}

/**
 * The four-stat health summary: connected / updated / stale / failed sources,
 * using the dedicated `--color-status-*` tokens (not severity aliases) and a
 * pulsing fail dot — the reader's first read of "is the data underneath this
 * product trustworthy right now." Mono numeric type keeps the row reading
 * as instrumentation, not a marketing stat block.
 */
export function HealthSummaryStrip({ sources, loading }: HealthSummaryStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4">
            <div className="ow-skeleton h-2 w-2 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="ow-skeleton mb-1.5 h-5 w-8 rounded" />
              <div className="ow-skeleton h-2.5 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ok = sources.filter((s) => s.worst_status === "ok").length;
  const stale = sources.filter((s) => s.worst_status === "stale" || s.worst_status === "warning").length;
  const failed = sources.filter((s) => s.worst_status === "error").length;

  const stats: { label: string; value: number; status?: "ok" | "stale" | "error"; pulse?: boolean }[] = [
    { label: "fontes conectadas", value: sources.length },
    { label: "atualizadas", value: ok, status: "ok" },
    { label: "desatualizadas", value: stale, status: "stale" },
    { label: "com falha", value: failed, status: "error", pulse: failed > 0 },
  ];

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-[var(--color-border)] sm:grid-cols-4 sm:divide-y-0">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-3 px-5 py-4">
          {s.status ? (
            <StatusDot size="sm" status={s.status} pulse={s.pulse} />
          ) : (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--color-text-3)" }} />
          )}
          <div className="min-w-0 leading-none">
            <div
              className="text-mono text-xl font-bold leading-none tabular-nums"
              style={{ color: s.status ? `var(--color-status-${s.status})` : "var(--color-text)" }}
            >
              {s.value}
            </div>
            <div className="mt-1.5 truncate text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
