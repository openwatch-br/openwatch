"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { formatBRL } from "@/lib/utils";
import type { DossieChapter } from "../helpers/dossieContent";
import { DossieHeading, DossieParagraph } from "./DossieProse";

/**
 * A chapter as it reads inside the dossiê publication: an anchored heading,
 * the signals of that typology surfaced as editorial entries, and a link to
 * the full chapter page. All content is derived from real signal data.
 */
export function DossieChapterSection({
  chapter,
  caseId,
}: {
  chapter: DossieChapter;
  caseId: string;
}) {
  return (
    <section>
      <DossieHeading id={chapter.typologyCode}>
        Capítulo {chapter.num} — {chapter.title}
      </DossieHeading>

      <DossieParagraph>
        {chapter.signals.length === 1
          ? "Um sinal desta tipologia sustenta o capítulo"
          : `${chapter.signals.length} sinais desta tipologia sustentam o capítulo`}
        {chapter.totalValue > 0 ? (
          <>
            {" "}
            movimentando{" "}
            <span className="font-mono text-primary">{formatBRL(chapter.totalValue)}</span> em
            eventos correlacionados
          </>
        ) : null}
        {chapter.avgConfidence != null ? (
          <>
            , com confiança média de{" "}
            <span className="font-mono text-primary">{chapter.avgConfidence}%</span>
          </>
        ) : null}
        .
      </DossieParagraph>

      <div className="my-5 flex flex-col gap-2.5">
        {chapter.signals.map((signal) => {
          const pct = signal.signal_confidence_score ?? Math.round(signal.confidence * 100);
          return (
            <Link
              key={signal.id}
              href={`/radar/dossie/${caseId}/sinal/${signal.id}`}
              className="group flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3 transition-colors hover:border-brand-border"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold leading-snug text-primary">
                  {signal.title}
                </p>
                {signal.summary && (
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-secondary">
                    {signal.summary}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <ConfidenceBadge score={pct} />
                <ArrowRight className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href={`/radar/dossie/${caseId}/capitulo/${chapter.typologyCode}`}
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-brand-text hover:opacity-80"
      >
        Ver capítulo completo <ArrowRight className="h-3 w-3" />
      </Link>
    </section>
  );
}
