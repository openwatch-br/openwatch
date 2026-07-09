"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { useDossieBook } from "./DossieBookContext";
import { DossieReadingShell, type TocEntry } from "./DossieReadingShell";
import { DossieMasthead } from "./DossieMasthead";
import { DossieLede, DossieCallout, DossiePullQuote } from "./DossieProse";
import { DossieChapterSection } from "./DossieChapterSection";
import { DossieEmbedFrame } from "./DossieEmbed";
import { CaseTimeline } from "./CaseTimeline";
import {
  buildDossieChapters,
  estimateReadingMinutes,
  countSources,
  pickFinding,
} from "../helpers/dossieContent";
import { buildCaseTimeline } from "../helpers/buildCaseTimeline";
import { formatBRL, formatDate } from "@/lib/utils";

const CaseNetworkGraph = dynamic(() => import("./CaseNetworkGraph"), {
  ssr: false,
  loading: () => <GraphFallback />,
});

function GraphFallback() {
  return (
    <div className="flex h-[360px] items-center justify-center font-mono text-[13px] text-muted">
      Carregando rede…
    </div>
  );
}

export default function CaseDossierPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = String(params["caseId"] ?? "");
  const { data, loading, error } = useDossieBook();
  const tab = searchParams.get("tab");

  const timelineModel = useMemo(
    () => (data ? buildCaseTimeline(data) : null),
    [data],
  );

  // Honor TabNav's Cronologia/Rede sub-tabs as in-page scroll anchors.
  useEffect(() => {
    if (!data) return;
    const id = tab === "rede" ? "rede" : null;
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tab, data]);

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
  const chapters = buildDossieChapters(data);
  const finding = pickFinding(data);

  const totalValue = data.events.reduce((sum, e) => sum + (e.value_brl ?? 0), 0);
  const primaryOrg = data.entities.find((e) => e.type === "org");
  const generated =
    typeof caseInfo.attrs.created_at === "string"
      ? formatDate(caseInfo.attrs.created_at)
      : null;

  const meta: string[] = [];
  if (primaryOrg) meta.push(primaryOrg.name);
  if (totalValue > 0) meta.push(formatBRL(totalValue));
  meta.push(`${data.events.length} eventos · ${data.entities.length} envolvidos`);
  if (generated) meta.push(`gerado ${generated}`);

  const toc: TocEntry[] = [
    { kind: "anchor", num: "—", label: "Folha de rosto", id: "folha-de-rosto" },
    ...chapters.map(
      (c): TocEntry => ({
        kind: "anchor",
        num: c.num,
        label: c.title,
        id: c.typologyCode,
        severity: c.severity,
      }),
    ),
    { kind: "anchor", num: "—", label: "Linha do tempo", id: "cronologia" },
    { kind: "anchor", num: "—", label: "Rede societária", id: "rede" },
  ];

  const railMeta = {
    dossieNumber: `Dossiê · ${caseInfo.id.slice(0, 8).toUpperCase()}`,
    caseId: caseInfo.id,
    provenanceOk: true,
    evidenceCount: data.events.length,
    sourceCount: countSources(data),
    readingMinutes: estimateReadingMinutes(data),
  };

  const timelineEmbed =
    timelineModel && timelineModel.items.length > 0 ? (
      <div id="cronologia" className="scroll-mt-[calc(var(--shell-height)+16px)]">
        <DossieEmbedFrame label="Linha do tempo dos eventos">
          <CaseTimeline model={timelineModel} />
        </DossieEmbedFrame>
      </div>
    ) : null;

  const graphEmbed = (
    <div id="rede" className="scroll-mt-[calc(var(--shell-height)+16px)]">
      <DossieEmbedFrame
        label={`Grafo do caso · ${data.entities.length} nós`}
        action={{ href: "/radar/rede", label: "abrir na Rede ⤢" }}
        headerBar
        bodyClassName="p-0"
      >
        <CaseNetworkGraph caseId={caseId} timelineRaw={data} />
      </DossieEmbedFrame>
    </div>
  );

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
        de dados públicos. Não constitui acusação nem prova de irregularidade — cada afirmação pode
        ser auditada até a fonte primária no laudo de cada sinal.
      </DossieCallout>

      {caseInfo.summary && <DossieLede>{caseInfo.summary}</DossieLede>}

      {chapters.map((chapter, i) => (
        <div key={chapter.typologyCode}>
          <DossieChapterSection chapter={chapter} caseId={caseId} />
          {i === 0 && timelineEmbed}
          {i === 1 && graphEmbed}
        </div>
      ))}

      {/* Embeds not yet placed inline (few/no chapters) fall to the end. */}
      {chapters.length < 1 && timelineEmbed}
      {chapters.length < 2 && graphEmbed}

      {finding && (
        <DossiePullQuote
          severity={finding.signal.severity}
          source={
            <Link href={`/radar/dossie/${caseId}/sinal/${finding.signal.id}`} className="hover:text-secondary">
              → ver laudo do sinal · {finding.typologyCode}
            </Link>
          }
        >
          {finding.signal.summary ?? finding.signal.title}
        </DossiePullQuote>
      )}
    </DossieReadingShell>
  );
}
