import Link from "next/link";
import { StatusDot } from "@/components/StatusDot";
import { relativeTime } from "@/lib/utils";
import type { CoverageV2SourceItem, CoverageStatus } from "@/lib/types";

const FAILING: ReadonlySet<CoverageStatus> = new Set(["error", "stale"]);

const STATUS_META: Record<CoverageStatus, string> = {
  ok: "text-[var(--color-text-3)]",
  warning: "text-[var(--color-status-warning)]",
  stale: "text-[var(--color-status-stale)]",
  error: "text-[var(--color-status-error)]",
  pending: "text-[var(--color-text-3)]",
};

interface SourceIntegrityRailProps {
  sources: CoverageV2SourceItem[];
  loading: boolean;
}

/**
 * Source integrity — the credibility of what you read depends on this. A live
 * list of connectors with a pulsing dot on any failing source. Real data from
 * the coverage endpoint (same source the /coverage page uses).
 */
export function SourceIntegrityRail({ sources, loading }: SourceIntegrityRailProps) {
  const failing = sources.filter((s) => FAILING.has(s.worst_status)).length;

  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-display text-[15px] font-semibold text-[var(--color-text)]">
          Integridade das fontes
        </h3>
        {failing > 0 && <StatusDot size="sm" status="error" pulse />}
      </div>
      <p className="mb-3.5 text-[11.5px] leading-snug text-[var(--color-text-3)]">
        A credibilidade do que você lê depende disto.
        {failing > 0
          ? ` ${failing} ${failing === 1 ? "fonte com falha" : "fontes com falha"}.`
          : " Todas as fontes operando."}
      </p>

      <div className="flex flex-col gap-0.5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ow-skeleton h-8 rounded-md" />
            ))
          : sources.map((s) => (
              <div
                key={s.connector}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-[var(--color-surface)]"
              >
                <StatusDot
                  size="sm"
                  status={s.worst_status}
                  pulse={FAILING.has(s.worst_status)}
                />
                <span className="flex-1 truncate text-[12.5px] text-[var(--color-text)]">
                  {s.connector_label}
                </span>
                <span className={`font-mono text-[10.5px] ${STATUS_META[s.worst_status]}`}>
                  {s.worst_status === "error"
                    ? "falha"
                    : s.last_success_at
                      ? relativeTime(s.last_success_at)
                      : "—"}
                </span>
              </div>
            ))}
      </div>

      <Link
        href="/coverage"
        className="mt-3 inline-block text-xs text-[var(--color-brand-text)] hover:text-[var(--color-text)]"
      >
        Ver cobertura completa ›
      </Link>
    </section>
  );
}
