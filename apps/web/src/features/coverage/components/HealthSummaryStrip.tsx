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
 * product trustworthy right now."
 */
export function HealthSummaryStrip({ sources, loading }: HealthSummaryStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] border border-[var(--color-border)] sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5">
            <div className="ow-skeleton mb-2 h-8 w-10 rounded" />
            <div className="ow-skeleton h-3 w-20 rounded" />
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
    <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] border border-[var(--color-border)] sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="p-5">
          <div
            className="font-display text-[34px] font-bold leading-none"
            style={{ color: s.status ? `var(--color-status-${s.status})` : "var(--color-text)" }}
          >
            {s.value}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{ color: "var(--color-text-3)" }}>
            {s.status && <StatusDot size="sm" status={s.status} pulse={s.pulse} />}
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
