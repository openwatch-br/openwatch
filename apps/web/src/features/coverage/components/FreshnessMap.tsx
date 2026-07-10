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

const LEGEND: { label: string; color: string; border?: boolean }[] = [
  { label: "ingeriu", color: "var(--color-status-ok)" },
  { label: "sem dado", color: "var(--color-surface-3)", border: true },
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
        <div>
          <p className="text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
            Mapa de frescor
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--color-text-3)" }}>
            Ingestão diária por fonte · janela de {DAYS} dias
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-[11px]" style={{ color: "var(--color-text-2)" }}>
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  background: l.color,
                  border: l.border ? "1px solid var(--color-border-strong)" : "none",
                }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Column header — mirrors the row grid so the strip reads as a calendar */}
      {!loading && sources.length > 0 && (
        <div
          className="mb-1.5 hidden text-mono-xs sm:grid sm:grid-cols-[minmax(0,210px)_1fr_110px_100px] sm:items-center sm:gap-4 sm:px-3"
          style={{ color: "var(--color-text-3)" }}
        >
          <span>Fonte</span>
          <span className="flex justify-between">
            <span>{from}</span>
            <span>{to}</span>
          </span>
          <span className="text-right">Último dado</span>
          <span className="text-right">Registros</span>
        </div>
      )}

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
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border-subtle)" }}>
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
    </section>
  );
}
