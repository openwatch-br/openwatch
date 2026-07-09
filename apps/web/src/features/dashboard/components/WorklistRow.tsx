import Link from "next/link";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { formatBRLCompact } from "@/lib/utils";
import { TYPOLOGY_LABELS } from "@/lib/constants";
import type { WorklistItem } from "../useHomeData";
import type { WorklistTag } from "../helpers";

const TAG_LABEL: Record<Exclude<WorklistTag, null>, string> = {
  novo: "NOVO",
  atualizado: "ATUALIZADO",
};

const TAG_CLASS: Record<Exclude<WorklistTag, null>, string> = {
  novo: "text-[var(--color-brand-text)] bg-[color-mix(in_srgb,var(--color-brand)_14%,transparent)]",
  atualizado: "text-[var(--color-text-2)] bg-[var(--color-surface-2)]",
};

/**
 * One triaged case in the home worklist — an editorial line, not a card:
 * rank · severity glyph · typology · title · novelty · why · org · value ·
 * confidence · provenance. Whole row links to the dossiê.
 */
export function WorklistRow({ item }: { item: WorklistItem }) {
  const typologyName = item.code ? TYPOLOGY_LABELS[item.code] : null;

  return (
    <Link
      href={`/radar/dossie/${item.id}`}
      className="group flex gap-3 border-t border-[var(--color-border-subtle)] py-4 transition-colors hover:bg-[var(--color-surface)] sm:gap-4"
    >
      <div className="hidden w-6 shrink-0 pt-0.5 text-center sm:block">
        <span className="font-mono text-[15px] font-semibold text-[var(--color-text-3)]">
          {String(item.rank).padStart(2, "0")}
        </span>
      </div>

      <div
        className="shrink-0 pt-1 text-[var(--color-text)]"
        style={{ color: `var(--color-${item.severity})` }}
      >
        <SeverityGlyph severity={item.severity} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {item.code && (
            <span className="rounded-[3px] border border-[var(--color-border)] px-1.5 py-px font-mono text-[11px] text-[var(--color-text-2)]">
              {item.code}
            </span>
          )}
          <span className="font-display text-[15px] font-semibold tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-brand-text)] sm:text-base">
            {item.title}
          </span>
          {item.tag && (
            <span className={`rounded-[3px] px-1.5 py-px font-mono text-[10px] ${TAG_CLASS[item.tag]}`}>
              {TAG_LABEL[item.tag]}
            </span>
          )}
        </div>

        {item.why && (
          <p className="mt-1.5 text-[13px] leading-snug text-[var(--color-text-2)] line-clamp-2">
            {item.why}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {item.org && (
            <span className="font-mono text-[11px] text-[var(--color-text-3)]">{item.org}</span>
          )}
          {typologyName && (
            <span className="hidden font-mono text-[11px] text-[var(--color-text-3)] sm:inline">
              {typologyName}
            </span>
          )}
          {item.value != null && (
            <span className="font-mono text-[11px] text-[var(--color-text-2)]">
              {formatBRLCompact(item.value)}
            </span>
          )}
          {item.confidence != null && <ConfidenceBadge score={item.confidence} />}
          <span className="ml-auto text-xs text-[var(--color-brand-text)] opacity-0 transition-opacity group-hover:opacity-100">
            proveniência ›
          </span>
        </div>
      </div>
    </Link>
  );
}
