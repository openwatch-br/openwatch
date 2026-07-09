"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SeverityBadge } from "@/components/Badge";
import { CaseTypeBadge } from "@/components/CaseTypeBadge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { formatDate } from "@/lib/utils";
import type { TimelineSignalDTO } from "@/lib/types";

interface SinalHeaderProps {
  signal: TimelineSignalDTO;
  caseId: string;
  confidenceScore: number;
}

/** Forensic report header: identifier row, badges, headline and source line. */
export function SinalHeader({ signal, caseId, confidenceScore }: SinalHeaderProps) {
  return (
    <header className="border-b border-border-subtle">
      {/* action row */}
      <div className="flex items-center gap-4 px-6 py-3 sm:px-8">
        <Link
          href={`/radar/dossie/${caseId}`}
          className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted hover:text-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dossiê
        </Link>
        <span className="font-mono text-[11px] text-muted">{signal.id.slice(0, 12).toUpperCase()}</span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/radar/dossie/${caseId}`}
            className="rounded-md border border-border px-3 py-1.5 text-[13px] font-semibold text-secondary transition-colors hover:border-border-strong hover:text-primary"
          >
            Ver dossiê ›
          </Link>
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
          <span className="text-border-strong">·</span>
          <span>{signal.entity_count} entidades · {signal.event_count} eventos</span>
        </div>
      </div>
    </header>
  );
}
