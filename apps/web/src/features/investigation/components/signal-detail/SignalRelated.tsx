"use client";

import Link from "next/link";
import { SeverityBadge } from "@/components/Badge";
import type { RelatedSignal, TypologyLegalBasis } from "@/lib/types";

/** Legal grounding (law articles) and sibling signals sharing the pattern. */
export function SignalRelated({
  legalBasis,
  relatedSignals,
}: {
  legalBasis: TypologyLegalBasis | null;
  relatedSignals: RelatedSignal[];
}) {
  if (!legalBasis && relatedSignals.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {legalBasis && legalBasis.law_articles.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Base legal
          </p>
          <div className="flex flex-col gap-2">
            {legalBasis.law_articles.map((art, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-subtle px-3.5 py-2.5"
              >
                <span className="font-mono text-[11px] font-semibold text-primary">{art.law_name}</span>
                <span className="font-mono text-[11px] text-muted">{art.article}</span>
                <span className="ml-auto text-[11px] italic text-muted">{art.violation_type}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {relatedSignals.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Sinais relacionados · {relatedSignals.length}
          </p>
          <div className="flex flex-col gap-2">
            {relatedSignals.map((rs) => (
              <Link
                key={rs.id}
                href={`/signal/${rs.id}`}
                className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-subtle px-3.5 py-3 transition-colors hover:border-border"
              >
                <SeverityBadge severity={rs.severity} />
                <span className="shrink-0 font-mono text-[11px] text-muted">{rs.typology_code}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-primary">{rs.title}</span>
                <span className="shrink-0 font-mono text-[12px] font-semibold text-brand-text tabular-nums">
                  {Math.round(rs.confidence * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
