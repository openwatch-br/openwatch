"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getSignalEvidence } from "@/lib/api";
import { EvidenceList } from "@/components/EvidenceList";
import type { EvidenceRef, EvidenceStats } from "@/lib/types";

const EVIDENCE_PAGE_SIZE = 20;

interface SignalEvidenceSectionProps {
  signalId: string;
  evidenceRefs: EvidenceRef[];
  evidenceStats?: EvidenceStats;
}

export function SignalEvidenceSection({
  signalId,
  evidenceRefs,
  evidenceStats,
}: SignalEvidenceSectionProps) {
  const [offset, setOffset] = useState(0);

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ["signal-evidence", signalId, offset],
    queryFn: () => getSignalEvidence(signalId, { offset, limit: EVIDENCE_PAGE_SIZE, sort: "occurred_at_desc" }),
    placeholderData: keepPreviousData,
  });

  const total = page?.total ?? evidenceStats?.total_events ?? evidenceRefs.length;

  if (isError) {
    return <p className="mt-6 text-sm text-error">Erro ao carregar evidências</p>;
  }

  return (
    <EvidenceList
      signalId={signalId}
      items={page?.items ?? []}
      total={total}
      offset={offset}
      limit={EVIDENCE_PAGE_SIZE}
      onPageChange={setOffset}
      loading={isLoading}
      refs={evidenceRefs}
    />
  );
}
