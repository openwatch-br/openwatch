"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { useDossieBook } from "@/features/dossie/components/DossieBookContext";
import { getSignalEvidence, getSignalProvenance } from "@/lib/api";
import type {
  TimelineEntityDTO,
  TimelineSignalDTO,
  SignalEvidencePage,
  SignalProvenanceResponse,
} from "@/lib/types";
import { formatBRL } from "@/lib/utils";

import { SinalHeader } from "./SinalHeader";
import { SinalFinancialFlow, type FlowNode } from "./SinalFinancialFlow";
import { SinalProvenance } from "./SinalProvenance";
import { SinalEvidenceList } from "./SinalEvidenceList";
import { InferencePanel, type InferenceField } from "./InferencePanel";
import { ContestationForm } from "@/components/ContestationForm";

const EVIDENCE_PAGE_SIZE = 10;

const ENTITY_TOKEN: Record<string, string> = {
  org: "var(--color-entity-org)",
  company: "var(--color-entity-company)",
  person: "var(--color-entity-person)",
};

const DISCLAIMER =
  "Não afirma dolo, fraude ou culpa. O registro pode estar suspenso por decisão não refletida na base, ou tratar-se de homônimo cadastral. É um indício que requer apuração — não uma condenação.";

export default function SinalPage() {
  const { caseId, signalId } = useParams<{ caseId: string; signalId: string }>();
  const { data, loading: ctxLoading, error: ctxError } = useDossieBook();

  const [evidence, setEvidence] = useState<SignalEvidencePage | null>(null);
  const [evidencePage, setEvidencePage] = useState(1);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [provenance, setProvenance] = useState<SignalProvenanceResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  const loadEvidencePage = useCallback(
    (page: number) => {
      setEvidenceLoading(true);
      getSignalEvidence(signalId, {
        offset: (page - 1) * EVIDENCE_PAGE_SIZE,
        limit: EVIDENCE_PAGE_SIZE,
      })
        .then((ev) => {
          setEvidence(ev);
          setEvidencePage(page);
        })
        .finally(() => setEvidenceLoading(false));
    },
    [signalId],
  );

  useEffect(() => {
    setApiLoading(true);
    Promise.all([
      getSignalEvidence(signalId, { offset: 0, limit: EVIDENCE_PAGE_SIZE }).catch(() => null),
      getSignalProvenance(signalId).catch(() => null),
    ])
      .then(([ev, prov]) => {
        setEvidence(ev);
        setProvenance(prov);
      })
      .finally(() => setApiLoading(false));
  }, [signalId]);

  const signal: TimelineSignalDTO | undefined = data?.signals.find((s) => s.id === signalId);

  // ── Derivations (real data only) ─────────────────────────────────────────
  const flow = useMemo(() => {
    if (!data || !signal) return null;
    const entityMap = new Map(data.entities.map((e) => [e.id, e]));
    const relatedEvents = data.events.filter((evt) => evt.signals.some((es) => es.id === signalId));
    const totalValue = relatedEvents.reduce((sum, evt) => sum + (evt.value_brl ?? 0), 0);
    const involved = new Set<string>();
    for (const evt of relatedEvents) for (const p of evt.participants) involved.add(p.entity_id);
    const entities = [...involved]
      .map((id) => entityMap.get(id))
      .filter((e): e is TimelineEntityDTO => e != null);
    const payer = entities.find((e) => e.type === "org");
    const recipient = entities.find((e) => e.type === "company");
    if (!payer || !recipient || totalValue <= 0) return null;
    const source: FlowNode = { name: payer.name, role: "órgão pagador", token: ENTITY_TOKEN.org! };
    const target: FlowNode = { name: recipient.name, role: "beneficiário", token: ENTITY_TOKEN.company! };
    return { source, target, amountLabel: formatBRL(totalValue) };
  }, [data, signal, signalId]);

  const legalRefs = useMemo(() => {
    if (!data || !signal) return [] as string[];
    return data.legal_hypotheses
      .filter(
        (h) =>
          !h.signal_cluster ||
          h.signal_cluster.length === 0 ||
          h.signal_cluster.includes(signalId) ||
          h.signal_cluster.includes(signal.typology_code),
      )
      .map((h) => (h.article ? `${h.law} art. ${h.article}` : h.law))
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 4);
  }, [data, signal, signalId]);

  // ── Loading / error ──────────────────────────────────────────────────────
  if (ctxLoading || apiLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-surface-card" />
        ))}
      </div>
    );
  }

  if (ctxError || !data) {
    return <SinalError caseId={caseId} message={ctxError ?? "Dossiê não encontrado."} />;
  }
  if (!signal) {
    return <SinalError caseId={caseId} message="Sinal não encontrado." />;
  }

  const confidenceScore = signal.signal_confidence_score ?? Math.round(signal.confidence * 100);

  const factorText =
    signal.factor_descriptions && Object.keys(signal.factor_descriptions).length > 0
      ? Object.values(signal.factor_descriptions)
          .map((f) => f.label)
          .join(", ")
      : null;

  const fields: InferenceField[] = [
    {
      label: "O que os dados mostram",
      tone: "data",
      body:
        signal.summary ??
        (factorText
          ? `Fatores detectados a partir de bases oficiais: ${factorText}.`
          : "Correlação detectada entre eventos oficiais concordantes."),
    },
    {
      label: "O que isto pode indicar",
      tone: "indicate",
      body:
        legalRefs.length > 0
          ? "Possível violação das normas referenciadas. Referência normativa exibida como apoio à apuração, não como enquadramento."
          : "Padrão que, à luz dos dados, merece apuração formal pelos órgãos de controle competentes.",
      ...(legalRefs.length > 0 ? { refs: legalRefs } : {}),
    },
    {
      label: "O que isto NÃO afirma",
      tone: "negate",
      body: DISCLAIMER,
    },
  ];

  return (
    <div>
      <SinalHeader signal={signal} caseId={caseId} confidenceScore={confidenceScore} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ── evidence bench ─────────────────────────────────────── */}
        <div className="flex flex-col gap-8 border-border-subtle px-6 py-7 sm:px-8 lg:border-r">
          {signal.summary && (
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                O achado
              </p>
              <p className="text-base leading-[1.7] text-secondary">{signal.summary}</p>
            </section>
          )}

          {flow && (
            <SinalFinancialFlow source={flow.source} target={flow.target} amountLabel={flow.amountLabel} />
          )}

          <SinalProvenance data={provenance} />

          <SinalEvidenceList
            evidence={evidence}
            page={evidencePage}
            pageSize={EVIDENCE_PAGE_SIZE}
            loading={evidenceLoading}
            onPage={loadEvidencePage}
          />

          <section id="contestar" className="scroll-mt-[calc(var(--shell-height)+16px)]">
            <ContestationForm signalId={signalId} />
          </section>
        </div>

        {/* ── inference panel ────────────────────────────────────── */}
        <aside className="bg-canvas px-6 py-7">
          <div className="sticky top-[calc(var(--shell-height)+24px)]">
            <InferencePanel
              fields={fields}
              score={confidenceScore}
              scoreNote={
                confidenceScore >= 80
                  ? "≥ 80 corroborada · fontes oficiais concordantes"
                  : "indício preliminar · requer corroboração adicional"
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SinalError({ caseId, message }: { caseId: string; message: string }) {
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
