"use client";

import { CONNECTOR_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { SignalProvenanceResponse } from "@/lib/types";

/** Provenance as the forensic spine: signal → each raw source it was built on. */
export function SinalProvenance({ data }: { data: SignalProvenanceResponse | null }) {
  const sources = (data?.events ?? []).flatMap((ev) =>
    ev.raw_sources.map((rs) => ({ ...rs, eventId: ev.event_id })),
  );

  if (sources.length === 0) return null;

  const sourceCount = new Set(sources.map((s) => s.connector)).size;

  const nodes = [
    { key: "signal", kind: "root" as const },
    ...sources.map((s) => ({ key: s.id, kind: "source" as const, source: s })),
  ];

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Cadeia de proveniência
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px]" style={{ color: "var(--color-success)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-success)" }} />
          íntegra · {sourceCount} {sourceCount === 1 ? "fonte" : "fontes"} cruzadas
        </span>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-subtle px-5 py-4">
        <div className="flex flex-col">
          {nodes.map((node, i) => {
            const isLast = i === nodes.length - 1;
            const isRoot = node.kind === "root";
            return (
              <div key={node.key} className="flex gap-3.5">
                <div className="flex w-3.5 flex-col items-center">
                  <span
                    className="shrink-0"
                    style={
                      isRoot
                        ? { width: 11, height: 11, borderRadius: "50%", background: "var(--color-brand)", marginTop: 3 }
                        : { width: 9, height: 9, borderRadius: "50%", border: "2px solid var(--color-brand)", background: "var(--color-surface)", marginTop: 4 }
                    }
                  />
                  {!isLast && <span className="mt-1 w-0.5 flex-1 bg-border-subtle" />}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  {isRoot ? (
                    <>
                      <p className="text-[13.5px] font-semibold text-primary">
                        {data?.title ?? "Sinal"}
                      </p>
                      <p className="mt-1 font-mono text-[10.5px] text-muted">
                        {data?.signal_id?.slice(0, 16).toUpperCase()}
                        {data?.typology_code ? ` · ${data.typology_code}` : ""}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold text-secondary">
                          {CONNECTOR_LABELS[node.source.connector] ?? node.source.connector}
                        </span>
                        <span className="text-[13px] font-semibold text-primary">{node.source.job}</span>
                      </div>
                      <p className="mt-1 font-mono text-[10.5px] text-muted">
                        {node.source.raw_id}
                        {node.source.created_at ? ` · ${formatDate(node.source.created_at)}` : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
