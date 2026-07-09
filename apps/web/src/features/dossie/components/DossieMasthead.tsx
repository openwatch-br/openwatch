"use client";

import { SeverityBadge } from "@/components/Badge";
import { CaseTypeBadge } from "@/components/CaseTypeBadge";
import type { SignalSeverity } from "@/lib/types";

interface DossieMastheadProps {
  typologyCode: string | null | undefined;
  severity: SignalSeverity;
  title: string;
  deck?: string | null;
  meta: string[];
}

/** Editorial cover / masthead: badges, headline, deck, and a mono meta line. */
export function DossieMasthead({
  typologyCode,
  severity,
  title,
  deck,
  meta,
}: DossieMastheadProps) {
  return (
    <header className="mb-9 border-b border-border-subtle pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <CaseTypeBadge caseType={typologyCode} />
        <SeverityBadge severity={severity} />
      </div>

      <h1
        className="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-primary"
      >
        {title}
      </h1>

      {deck && (
        <p className="mt-3 font-display text-lg font-normal leading-[1.35] text-secondary sm:text-xl">
          {deck}
        </p>
      )}

      {meta.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-muted">
          {meta.map((m, i) => (
            <span key={m} className="flex items-center gap-3">
              {i > 0 && <span className="text-border-strong">·</span>}
              {m}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
