"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { useDossieBook } from "./DossieBookContext";
import { DossieReadingShell, type TocEntry } from "./DossieReadingShell";
import { DossieMasthead } from "./DossieMasthead";
import { DossieHeading } from "./DossieProse";
import { SignalCard } from "./SignalCard";
import { EntityMiniCard } from "./EntityMiniCard";
import {
  buildDossieChapters,
  estimateReadingMinutes,
  countSources,
} from "../helpers/dossieContent";
import { formatBRL, formatDate } from "@/lib/utils";
import type { TimelineEntityDTO } from "@/lib/types";

export default function CapituloPage() {
  const { caseId, typologyCode } = useParams<{ caseId: string; typologyCode: string }>();
  const { data, loading, error } = useDossieBook();

  if (loading) {
    return (
      <div className="mx-auto max-w-[680px] space-y-4 px-6 py-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl border border-border bg-surface-card" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <ChapterError caseId={caseId} message={error ?? "Dossiê não encontrado."} />
    );
  }

  const chapters = buildDossieChapters(data);
  const chapter = chapters.find((c) => c.typologyCode === typologyCode);

  if (!chapter) {
    return (
      <ChapterError caseId={caseId} message={`Capítulo ${typologyCode} não encontrado.`} />
    );
  }

  // Per-signal entity resolver (events referencing the signal).
  const entityMap = new Map(data.entities.map((e) => [e.id, e]));
  function signalEntities(signalId: string): TimelineEntityDTO[] {
    const ids = new Set<string>();
    for (const evt of data!.events) {
      if (evt.signals.some((es) => es.id === signalId)) {
        for (const p of evt.participants) ids.add(p.entity_id);
      }
    }
    return [...ids].map((id) => entityMap.get(id)).filter((e): e is TimelineEntityDTO => e != null);
  }

  const periods = chapter.signals
    .flatMap((sig) => [sig.period_start, sig.period_end])
    .filter((d): d is string => d != null)
    .sort();
  const periodStr =
    periods.length > 0
      ? `${formatDate(periods[0]!)} — ${formatDate(periods[periods.length - 1]!)}`
      : null;

  const meta: string[] = [
    `${chapter.signals.length} ${chapter.signals.length === 1 ? "sinal" : "sinais"}`,
  ];
  if (chapter.avgConfidence != null) {
    meta.push(`confiança média ${chapter.avgConfidence}%`);
  }
  if (periodStr) meta.push(periodStr);
  if (chapter.totalValue > 0) meta.push(formatBRL(chapter.totalValue));

  const toc: TocEntry[] = [
    { kind: "route", num: "—", label: "Folha de rosto", href: `/radar/dossie/${caseId}` },
    ...chapters.map(
      (c): TocEntry => ({
        kind: "route",
        num: c.num,
        label: c.title,
        href: `/radar/dossie/${caseId}/capitulo/${c.typologyCode}`,
        active: c.typologyCode === typologyCode,
        severity: c.severity,
      }),
    ),
  ];

  const railMeta = {
    dossieNumber: `Capítulo ${chapter.num}`,
    caseId,
    provenanceOk: true,
    evidenceCount: data.events.length,
    sourceCount: countSources(data),
    readingMinutes: estimateReadingMinutes(data),
  };

  return (
    <DossieReadingShell meta={railMeta} toc={toc}>
      <Link
        href={`/radar/dossie/${caseId}`}
        className="mb-6 inline-flex font-mono text-[12px] text-muted hover:text-secondary"
      >
        ‹ Folha de rosto
      </Link>

      <DossieMasthead
        typologyCode={chapter.typologyCode}
        severity={chapter.severity}
        title={chapter.title}
        meta={meta}
      />

      <section>
        <DossieHeading id="sinais">Sinais do capítulo</DossieHeading>
        <div className="flex flex-col gap-4">
          {chapter.signals.map((sig) => (
            <SignalCard
              key={sig.id}
              signal={sig}
              entities={signalEntities(sig.id)}
              caseId={caseId}
            />
          ))}
        </div>
      </section>

      {chapter.entities.length > 0 && (
        <section>
          <DossieHeading id="entidades">Entidades deste capítulo</DossieHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {chapter.entities.map((entity) => (
              <EntityMiniCard
                key={entity.id}
                entity={entity}
                href={`/entity/${entity.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </DossieReadingShell>
  );
}

function ChapterError({ caseId, message }: { caseId: string; message: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-critical-border bg-critical-bg p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-critical" />
        <p className="mb-4 text-sm text-critical">{message}</p>
        <Link href={`/radar/dossie/${caseId}`} className="text-xs text-brand-text hover:underline">
          Voltar ao dossiê
        </Link>
      </div>
    </div>
  );
}
