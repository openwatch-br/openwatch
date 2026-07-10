import type { CoverageV2SourceItem, CoverageV2SourcePreviewResponse } from "@/lib/types";
import { FreshnessRow } from "./FreshnessRow";
import { freshnessDateRangeLabel } from "@/features/coverage/lib/freshnessCells";

const DAYS = 30;

interface FreshnessMapProps {
  sources: CoverageV2SourceItem[];
  historyByConnector: Map<string, CoverageV2SourcePreviewResponse>;
  loading: boolean;
  onSelectSource: (item: CoverageV2SourceItem) => void;
}

const LEGEND: { label: string; color: string }[] = [
  { label: "ingeriu", color: "var(--color-status-ok)" },
  { label: "sem dado", color: "var(--color-border-subtle)" },
  { label: "falha", color: "var(--color-status-error)" },
];

/**
 * The freshness map — the page's headline composition. One row per source,
 * each a 30-day ingestion strip, so a coverage gap reads as a hole in the
 * strip instead of a single "status: red" chip. Cell history is real (see
 * `useSourceRunHistory` + `freshnessCells.ts`), not synthetic.
 */
export function FreshnessMap({ sources, historyByConnector, loading, onSelectSource }: FreshnessMapProps) {
  const { from, to } = freshnessDateRangeLabel(DAYS);

  return (
    <section className="ow-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
          Mapa de frescor · ingestão diária por fonte
        </p>
        <div className="flex flex-wrap gap-3.5 text-[11px]" style={{ color: "var(--color-text-2)" }}>
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ow-skeleton h-12 rounded-md" />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <p className="py-6 text-center text-caption" style={{ color: "var(--color-text-3)" }}>
          Nenhuma fonte encontrada para os filtros selecionados.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {sources.map((item) => (
            <FreshnessRow
              key={item.connector}
              item={item}
              preview={historyByConnector.get(item.connector)}
              days={DAYS}
              onSelect={() => onSelectSource(item)}
            />
          ))}
        </div>
      )}

      <div
        className="mt-3 hidden justify-between px-3 text-mono-xs sm:flex"
        style={{ color: "var(--color-text-3)" }}
      >
        <span className="w-[210px]" />
        <span className="flex-1 text-left">{from}</span>
        <span className="w-[220px] text-right" style={{ color: "var(--color-text-2)" }}>{to}</span>
      </div>
    </section>
  );
}
