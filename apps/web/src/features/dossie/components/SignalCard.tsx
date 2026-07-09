"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SeverityBadge } from "@/components/Badge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { formatDate } from "@/lib/utils";
import type { TimelineEntityDTO, TimelineSignalDTO } from "@/lib/types";
import { severityColor } from "./dossieSeverity";

const ENTITY_TOKEN: Record<string, string> = {
  org: "var(--color-entity-org)",
  company: "var(--color-entity-company)",
  person: "var(--color-entity-person)",
};

/** Full signal card used on the chapter page: severity/confidence, involved
 *  entities, factor pills, and a link into the forensic signal page. */
export function SignalCard({
  signal,
  entities,
  caseId,
}: {
  signal: TimelineSignalDTO;
  entities: TimelineEntityDTO[];
  caseId: string;
}) {
  const accent = severityColor(signal.severity);
  const pct = signal.signal_confidence_score ?? Math.round(signal.confidence * 100);
  const factorKeys = signal.factor_descriptions
    ? Object.keys(signal.factor_descriptions)
    : Object.keys(signal.factors);
  const preview = factorKeys.slice(0, 3);
  const remaining = factorKeys.length - preview.length;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-surface-card"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="px-5 py-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-secondary">{signal.typology_code}</span>
            <SeverityBadge severity={signal.severity} />
            <ConfidenceBadge score={pct} />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-muted">
            {signal.period_start ? formatDate(signal.period_start) : "—"}
            {signal.period_end ? ` — ${formatDate(signal.period_end)}` : ""}
          </span>
        </div>

        <h3 className="text-base font-bold leading-snug text-primary">{signal.title}</h3>
        {signal.summary && (
          <p className="mt-1.5 text-sm leading-relaxed text-secondary">{signal.summary}</p>
        )}

        {entities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entities.slice(0, 4).map((ent) => {
              const col = ENTITY_TOKEN[ent.type] ?? "var(--color-entity-unknown)";
              return (
                <span
                  key={ent.id}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px]"
                  style={{ borderColor: `${col}30`, backgroundColor: `${col}0D`, color: col }}
                >
                  {ent.name.split(" ")[0]}
                </span>
              );
            })}
            {entities.length > 4 && (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                +{entities.length - 4}
              </span>
            )}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {preview.map((key) => (
              <span
                key={key}
                className="rounded-full border border-border bg-surface-subtle px-2.5 py-1 font-mono text-[10px] text-secondary"
              >
                {signal.factor_descriptions?.[key]?.label ?? key}
              </span>
            ))}
            {remaining > 0 && (
              <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted">
                e mais {remaining}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/radar/dossie/${caseId}/sinal/${signal.id}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-subtle px-4 py-2 font-mono text-xs font-bold text-brand-text transition-colors hover:border-brand-border"
        >
          Ver laudo do sinal <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
