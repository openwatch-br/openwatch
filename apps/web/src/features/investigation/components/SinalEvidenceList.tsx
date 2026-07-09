"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { CONNECTOR_LABELS } from "@/lib/constants";
import { cn, formatBRL, formatDate, normalizeUnknownDisplay } from "@/lib/utils";
import type { SignalEvidencePage } from "@/lib/types";

interface SinalEvidenceListProps {
  evidence: SignalEvidencePage | null;
  page: number;
  pageSize: number;
  loading: boolean;
  onPage: (page: number) => void;
}

/** Forensic evidence bench: one row per source document, with pagination. */
export function SinalEvidenceList({
  evidence,
  page,
  pageSize,
  loading,
  onPage,
}: SinalEvidenceListProps) {
  const total = evidence?.total ?? 0;
  if (!evidence || total === 0) return null;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Evidências · {total}
      </p>

      <div className={cn("flex flex-col gap-2 transition-opacity", loading && "pointer-events-none opacity-40")}>
        {evidence.items.map((item) => (
          <div
            key={item.event_id}
            className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-subtle px-3.5 py-3 transition-colors hover:border-border"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-card font-mono text-[8.5px] uppercase text-muted">
              {(CONNECTOR_LABELS[item.source_connector] ?? item.source_connector).slice(0, 4)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-primary">{item.description}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted">
                {CONNECTOR_LABELS[item.source_connector] ?? item.source_connector}
                {item.occurred_at ? ` · ${formatDate(item.occurred_at)}` : ""}
                {typeof item.value_brl === "number" ? ` · ${formatBRL(item.value_brl)}` : ""}
                {item.modality ? ` · ${normalizeUnknownDisplay(item.modality)}` : ""}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-secondary sm:inline">
              {item.evidence_reason}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>
          <span className="font-mono text-xs text-muted">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
