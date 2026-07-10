import { StatusDot } from "@/components/StatusDot";
import { relativeTime } from "@/lib/utils";
import type { CoverageV2SourceItem, CoverageV2SourcePreviewResponse } from "@/lib/types";
import { buildFreshnessCells } from "@/features/coverage/lib/freshnessCells";

interface FreshnessRowProps {
  item: CoverageV2SourceItem;
  preview: CoverageV2SourcePreviewResponse | undefined;
  days: number;
  onSelect: () => void;
}

/** One source's 30-day ingestion strip: name, daily cells, last-run meta, record count. */
export function FreshnessRow({ item, preview, days, onSelect }: FreshnessRowProps) {
  const cells = buildFreshnessCells(preview?.recent_runs ?? [], days);
  const kind = preview?.jobs[0]?.domain ?? `${item.job_count} job${item.job_count === 1 ? "" : "s"}`;
  const totalRecords = preview
    ? preview.jobs.reduce((sum, j) => sum + j.total_items, 0)
    : null;

  const metaColor = item.worst_status === "error" ? "var(--color-status-error)"
    : item.worst_status === "stale" || item.worst_status === "warning" ? "var(--color-status-warning)"
    : "var(--color-text-3)";
  const meta = item.worst_status === "error"
    ? (item.last_success_at ? `falha · ${relativeTime(item.last_success_at)}` : "falha")
    : item.last_success_at ? relativeTime(item.last_success_at) : "—";

  const cellStrip = (
    <div className="flex items-center gap-[2px]" aria-hidden={!preview}>
      {cells.map((c, i) => (
        <span
          key={i}
          title={c.title}
          className="h-[18px] flex-1 rounded-sm sm:h-[22px]"
          style={{
            background: c.status === "ok"
              ? "var(--color-status-ok)"
              : c.status === "failed"
                ? "var(--color-status-error)"
                : "var(--color-border-subtle)",
            opacity: preview ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-2 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface)] sm:grid sm:grid-cols-[minmax(0,210px)_1fr_110px_100px] sm:items-center sm:gap-4"
    >
      <div className="flex min-w-0 items-center justify-between gap-2.5 sm:justify-start">
        <div className="flex min-w-0 items-center gap-2.5">
          <StatusDot size="sm" status={item.worst_status} pulse={item.worst_status === "error"} />
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold" style={{ color: "var(--color-text)" }}>
              {item.connector_label}
            </div>
            <div className="truncate text-mono-xs" style={{ color: "var(--color-text-3)" }}>{kind}</div>
          </div>
        </div>
        <span className="shrink-0 text-mono-xs sm:hidden" style={{ color: metaColor }}>{meta}</span>
      </div>

      {cellStrip}

      <div className="hidden text-right text-mono-xs sm:block" style={{ color: metaColor }}>{meta}</div>
      <div className="hidden text-right text-mono-xs sm:block" style={{ color: "var(--color-text-3)" }}>
        {totalRecords != null ? `${totalRecords.toLocaleString("pt-BR")} reg.` : "…"}
      </div>
    </button>
  );
}
