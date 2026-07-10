"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileJson, FileText } from "lucide-react";
import type { IngestRunSampleRecord } from "@/lib/types";
import { fmtDate } from "@/features/coverage/lib/coverageStatus";
import { shouldRenderAsBlock, stringifyJson } from "@/features/coverage/lib/runDetailFormat";

const SAMPLES_PER_PAGE = 10;

interface RunSamplesViewerProps {
  samples: IngestRunSampleRecord[];
}

/** Collapsible raw-record sample viewer, paginated, with a JSON drill-down per record. */
export function RunSamplesViewer({ samples }: RunSamplesViewerProps) {
  const [open, setOpen] = useState(false);
  const [openSamples, setOpenSamples] = useState<Set<number>>(() => new Set());
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(samples.length / SAMPLES_PER_PAGE);
  const globalOffset = page * SAMPLES_PER_PAGE;
  const paged = samples.slice(globalOffset, globalOffset + SAMPLES_PER_PAGE);

  return (
    <section className="ow-card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-2)]">
        <div className="flex items-center gap-2.5">
          <FileJson className="h-4 w-4" style={{ color: "var(--color-brand-text)" }} />
          <div>
            <p className="font-display text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Amostra de registros
              <span className="ml-2 font-mono text-xs font-normal" style={{ color: "var(--color-text-3)" }}>({samples.length})</span>
            </p>
            <p className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>
              Registros reais para auditoria e verificação de qualidade
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-3)" }} /> : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-3)" }} />}
      </button>

      {open && (
        <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--color-border)" }}>
          {samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border py-10" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)" }}>
              <FileText className="h-7 w-7" style={{ color: "var(--color-text-3)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-3)" }}>Nenhum registro bruto encontrado para esta execução.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paged.map((sample, localIndex) => {
                  const gIdx = globalOffset + localIndex;
                  const isOpen = openSamples.has(gIdx);
                  return (
                    <article key={sample.raw_id} className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)" }}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="ow-badge ow-badge-signal flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold">
                            {gIdx + 1}
                          </span>
                          <code className="font-mono text-xs font-bold" style={{ color: "var(--color-text)" }}>{sample.raw_id}</code>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums" style={{ color: "var(--color-text-3)" }}>{fmtDate(sample.created_at)}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {Object.entries(sample.preview).map(([key, value]) => {
                          const display = typeof value === "string" ? value : stringifyJson(value);
                          const isBlock = shouldRenderAsBlock(display);
                          return (
                            <div key={`${sample.raw_id}-${key}`} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                              <p className="mb-1 font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>{key}</p>
                              {isBlock ? (
                                <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                                  {display}
                                </pre>
                              ) : (
                                <p className="break-words text-xs" style={{ color: "var(--color-text-2)" }}>{display}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <details
                        className="mt-3 overflow-hidden rounded-xl border"
                        style={{ borderColor: "var(--color-border)" }}
                        open={isOpen}
                        onToggle={(e) => {
                          const next = new Set(openSamples);
                          (e.currentTarget as HTMLDetailsElement).open ? next.add(gIdx) : next.delete(gIdx);
                          setOpenSamples(next);
                        }}
                      >
                        <summary className="cursor-pointer px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors" style={{ background: "var(--color-canvas)", color: "var(--color-text-3)" }}>
                          Ver JSON bruto original
                        </summary>
                        <pre className="max-h-72 overflow-auto border-t p-4 font-mono text-[11px] leading-relaxed" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-2)" }}>
                          {stringifyJson(sample.raw_data)}
                        </pre>
                      </details>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                  <p className="font-mono text-[11px] tabular-nums" style={{ color: "var(--color-text-3)" }}>
                    {globalOffset + 1}–{Math.min(globalOffset + SAMPLES_PER_PAGE, samples.length)} de {samples.length} registros
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-2)" }}
                    >
                      Anterior
                    </button>
                    <span className="px-2 font-mono text-xs tabular-nums" style={{ color: "var(--color-text-3)" }}>
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-2)" }}
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
