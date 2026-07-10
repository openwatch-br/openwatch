"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { SeverityBadge } from "@/components/Badge";
import { CaseTypeBadge } from "@/components/CaseTypeBadge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { formatDate } from "@/lib/utils";
import type { SignalDetail } from "@/lib/types";

interface SignalDetailHeaderProps {
  signal: SignalDetail;
  confidenceScore: number | null;
  onExport?: () => void;
  exporting?: boolean;
}

/** Forensic report masthead: action row, badges, headline and source line. */
export function SignalDetailHeader({
  signal,
  confidenceScore,
  onExport,
  exporting,
}: SignalDetailHeaderProps) {
  const entityCount = signal.entities?.length ?? signal.entity_ids?.length ?? 0;
  const eventCount = signal.evidence_stats?.total_events ?? signal.event_ids?.length ?? 0;

  return (
    <header className="border-b border-border-subtle">
      {/* action row */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-3 sm:px-8">
        <Link
          href="/radar"
          className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted hover:text-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Radar
        </Link>
        <span className="font-mono text-[11px] text-muted">{signal.id.slice(0, 12).toUpperCase()}</span>
        <div className="ml-auto flex items-center gap-2">
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] font-semibold text-secondary transition-colors hover:border-border-strong hover:text-primary disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> {exporting ? "Exportando…" : "Exportar"}
            </button>
          )}
          {signal.case_id && (
            <Link
              href={`/radar/dossie/${signal.case_id}`}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] font-semibold text-secondary transition-colors hover:border-border-strong hover:text-primary"
            >
              Ver dossiê ›
            </Link>
          )}
          <a
            href="#contestar"
            className="rounded-md border border-critical-border px-3 py-1.5 text-[13px] font-semibold text-critical transition-colors hover:bg-critical-bg"
          >
            Contestar
          </a>
        </div>
      </div>

      {/* headline */}
      <div className="px-6 pb-7 pt-2 sm:px-8">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <CaseTypeBadge caseType={signal.typology_code} />
          <SeverityBadge severity={signal.severity} />
          <ConfidenceBadge score={confidenceScore} />
        </div>
        <h1 className="font-display text-[clamp(1.6rem,3vw,1.9rem)] font-bold leading-[1.12] tracking-[-0.02em] text-primary">
          {signal.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-muted">
          <span>{signal.typology_name}</span>
          {signal.period_start && (
            <>
              <span className="text-border-strong">·</span>
              <span>detectado {formatDate(signal.period_start)}</span>
            </>
          )}
          {(entityCount > 0 || eventCount > 0) && (
            <>
              <span className="text-border-strong">·</span>
              <span>
                {entityCount} entidades · {eventCount} eventos
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
