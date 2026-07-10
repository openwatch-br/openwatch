"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import { useDossieBook } from "./DossieBookContext";
import { DossieReadingShell, type TocEntry } from "./DossieReadingShell";
import { DossieMasthead } from "./DossieMasthead";
import { DossieLede, DossieCallout } from "./DossieProse";
import { DossieHeading } from "./DossieProse";
import { DossieSignalAccordion } from "./DossieSignalAccordion";
import { DossieEmbedFrame } from "./DossieEmbed";
import { CaseTimeline } from "./CaseTimeline";
import {
  estimateReadingMinutes,
  countSources,
} from "../helpers/dossieContent";
import { buildCaseTimeline } from "../helpers/buildCaseTimeline";
import { formatBRL, formatDate } from "@/lib/utils";
import type { SignalSeverity, TimelineSignalDTO } from "@/lib/types";

const SEV_RANK: Record<SignalSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function confidenceOf(s: TimelineSignalDTO): number {
  return s.signal_confidence_score ?? (s.confidence != null ? s.confidence * 100 : 0);
}

export default function CaseDossierPage() {
  const { data, loading, error } = useDossieBook();

  const timelineModel = useMemo(
    () => (data ? buildCaseTimeline(data) : null),
    [data],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-[680px] space-y-4 px-6 py-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface-card" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-critical-border bg-critical-bg p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-critical" />
          <p className="text-sm text-critical">{error ?? "Dossiê não encontrado."}</p>
        </div>
      </div>
    );
  }

  const { case: caseInfo } = data;

  // Signals, worst first, each paired with the events that back it.
  const signals = [...data.signals].sort(
    (a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || confidenceOf(b) - confidenceOf(a),
  );
  const eventsForSignal = (signalId: string) =>
    data.events.filter((e) => e.signals.some((s) => s.id === signalId));

  const totalValue = data.events.reduce((sum, e) => sum + (e.value_brl ?? 0), 0);
  const primaryOrg = data.entities.find((e) => e.type === "org");
  const generated =
    typeof caseInfo.attrs.created_at === "string" ? formatDate(caseInfo.attrs.created_at) : null;

  const meta: string[] = [];
  if (primaryOrg) meta.push(primaryOrg.name);
  if (totalValue > 0) meta.push(formatBRL(totalValue));
  meta.push(`${data.events.length} eventos · ${data.entities.length} envolvidos`);
  if (generated) meta.push(`gerado ${generated}`);

  const toc: TocEntry[] = [
    { kind: "anchor", num: "—", label: "Folha de rosto", id: "folha-de-rosto" },
    ...signals.map(
      (s, i): TocEntry => ({
        kind: "anchor",
        num: String(i + 1).padStart(2, "0"),
        label: s.title,
        id: `sig-${s.id}`,
        severity: s.severity,
      }),
    ),
    { kind: "anchor", num: "—", label: "Linha do tempo", id: "cronologia" },
  ];

  const railMeta = {
    dossieNumber: `Dossiê · ${caseInfo.id.slice(0, 8).toUpperCase()}`,
    caseId: caseInfo.id,
    provenanceOk: true,
    evidenceCount: data.events.length,
    sourceCount: countSources(data),
    readingMinutes: estimateReadingMinutes(data),
  };

  return (
    <DossieReadingShell meta={railMeta} toc={toc} scrollSpy>
      <div id="folha-de-rosto" className="scroll-mt-[calc(var(--shell-height)+16px)]">
        <DossieMasthead
          typologyCode={caseInfo.case_type}
          severity={caseInfo.severity}
          title={caseInfo.title}
          deck={caseInfo.summary}
          meta={meta}
        />
      </div>

      <DossieCallout>
        Este dossiê reúne <strong className="font-semibold text-primary">indícios</strong> derivados
        de dados públicos. Não constitui acusação nem prova de irregularidade — cada achado abaixo pode
        ser aberto e auditado até a fonte primária.
      </DossieCallout>

      {caseInfo.summary && <DossieLede>{caseInfo.summary}</DossieLede>}

      <section>
        <DossieHeading id="achados">
          {signals.length === 1 ? "O achado" : `Os ${signals.length} achados`}
        </DossieHeading>
        <div className="flex flex-col gap-3">
          {signals.map((sig, i) => (
            <DossieSignalAccordion
              key={sig.id}
              signal={sig}
              events={eventsForSignal(sig.id)}
              index={i}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </section>

      {timelineModel && timelineModel.items.length > 0 && (
        <div id="cronologia" className="scroll-mt-[calc(var(--shell-height)+16px)]">
          <DossieEmbedFrame label="Linha do tempo dos eventos">
            <CaseTimeline model={timelineModel} />
          </DossieEmbedFrame>
        </div>
      )}
    </DossieReadingShell>
  );
}
