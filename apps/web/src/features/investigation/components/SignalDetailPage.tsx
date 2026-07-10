"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getSignal,
  getSignalEvidence,
  getSignalProvenance,
  getSignalEvidenceExportBlob,
  fetchTypologyLegalBasis,
  fetchRelatedSignals,
} from "@/lib/api";
import type {
  SignalDetail,
  SignalEvidencePage,
  SignalProvenanceResponse,
  TypologyLegalBasis,
  RelatedSignal,
} from "@/lib/types";

import { SinalProvenance } from "./SinalProvenance";
import { SinalEvidenceList } from "./SinalEvidenceList";
import { InferencePanel } from "./InferencePanel";

import { SignalDetailHeader } from "./signal-detail/SignalDetailHeader";
import { SignalFinding } from "./signal-detail/SignalFinding";
import { SignalFactors } from "./signal-detail/SignalFactors";
import { SignalEntities } from "./signal-detail/SignalEntities";
import { SignalRelated } from "./signal-detail/SignalRelated";
import { SignalDetailSkeleton, SignalDetailError } from "./signal-detail/SignalDetailStates";
import { buildInferenceFields, inferenceScore } from "./signal-detail/inference";

const EVIDENCE_PAGE_SIZE = 10;

/**
 * `/signal/[id]` — the standalone forensic "laudo" for a single signal.
 * Recomposed to the Nexo 2-column laudo pattern (evidence bench + persistent
 * inference panel) and decomposed into focused sections; the orchestrator only
 * fetches data and composes.
 */
export default function SignalDetailPage() {
  const params = useParams();
  const signalId = params["id"] as string;

  const [signal, setSignal] = useState<SignalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [provenance, setProvenance] = useState<SignalProvenanceResponse | null>(null);
  const [evidence, setEvidence] = useState<SignalEvidencePage | null>(null);
  const [evidencePage, setEvidencePage] = useState(1);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  const [legalBasis, setLegalBasis] = useState<TypologyLegalBasis | null>(null);
  const [relatedSignals, setRelatedSignals] = useState<RelatedSignal[]>([]);
  const [exporting, setExporting] = useState(false);

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
        .catch(() => {})
        .finally(() => setEvidenceLoading(false));
    },
    [signalId],
  );

  // Phase 1: core signal + immediate forensic context.
  useEffect(() => {
    if (!signalId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getSignal(signalId),
      getSignalEvidence(signalId, { offset: 0, limit: EVIDENCE_PAGE_SIZE }).catch(() => null),
      getSignalProvenance(signalId).catch(() => null),
    ])
      .then(([sig, ev, prov]) => {
        setSignal(sig);
        setEvidence(ev);
        setProvenance(prov);
      })
      .catch(() => setError("Sinal não encontrado"))
      .finally(() => setLoading(false));
  }, [signalId]);

  // Phase 2: legal grounding + siblings (need resolved signal fields).
  useEffect(() => {
    if (!signal) return;
    fetchTypologyLegalBasis(signal.typology_code).then(setLegalBasis).catch(() => {});
    fetchRelatedSignals(signal.id).then(setRelatedSignals).catch(() => {});
  }, [signal]);

  const handleExport = useCallback(() => {
    setExporting(true);
    getSignalEvidenceExportBlob(signalId)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sinal-${signalId}-evidencias.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {})
      .finally(() => setExporting(false));
  }, [signalId]);

  if (loading) return <SignalDetailSkeleton />;
  if (error || !signal) return <SignalDetailError message={error} />;

  const score = inferenceScore(signal);
  const fields = buildInferenceFields(signal, legalBasis);
  const entities = signal.entities ?? [];

  return (
    <div>
      <SignalDetailHeader
        signal={signal}
        confidenceScore={score}
        onExport={handleExport}
        exporting={exporting}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ── evidence bench ─────────────────────────────────────── */}
        <div className="flex flex-col gap-8 border-border-subtle px-6 py-7 sm:px-8 lg:border-r">
          <SignalFinding signal={signal} />
          <SinalProvenance data={provenance} />
          <SinalEvidenceList
            evidence={evidence}
            page={evidencePage}
            pageSize={EVIDENCE_PAGE_SIZE}
            loading={evidenceLoading}
            onPage={loadEvidencePage}
          />
          <SignalFactors signal={signal} />
          <SignalEntities entities={entities} />
          <SignalRelated legalBasis={legalBasis} relatedSignals={relatedSignals} />
        </div>

        {/* ── inference panel ────────────────────────────────────── */}
        <aside className="bg-canvas px-6 py-7">
          <div className="sticky top-[calc(var(--shell-height)+24px)]">
            <InferencePanel
              fields={fields}
              score={score}
              scoreNote={
                score != null && score >= 80
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
