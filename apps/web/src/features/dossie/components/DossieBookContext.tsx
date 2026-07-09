"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getDossierTimeline } from "@/lib/api";
import type {
  DossierTimelineResponse,
  DossieBookContextValue,
  BookPage,
  SignalSeverity,
  TimelineSignalDTO,
} from "@/lib/types";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const DossieBookContext = createContext<DossieBookContextValue>({
  data: null,
  loading: true,
  error: null,
  pages: [],
  currentIndex: -1,
});

export function useDossieBook() {
  return useContext(DossieBookContext);
}

/**
 * Loads the dossier timeline once for a case and exposes it (plus the derived
 * book page-sequence and the active page index) to every dossiê sub-route via
 * context. Mounted in the case layout so overview, chapter and signal pages
 * share a single fetch instead of each re-loading the payload. Uses the same
 * react-query key as `useCaseTimeline`, so requests dedupe.
 */
export function DossieBookProvider({
  caseId,
  children,
}: {
  caseId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data, isLoading, error } = useQuery({
    queryKey: ["case-timeline", caseId],
    queryFn: () => getDossierTimeline(caseId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: caseId.length > 0,
  });

  const value = useMemo<DossieBookContextValue>(() => {
    const pages = data ? buildBookSequence(caseId, data) : [];
    const normalized = pathname?.replace(/\/+$/, "") ?? "";
    const currentIndex = pages.findIndex(
      (p) => p.href.replace(/\/+$/, "") === normalized,
    );
    return {
      data: data ?? null,
      loading: isLoading,
      error: error ? "Não foi possível carregar o dossiê." : null,
      pages,
      currentIndex,
    };
  }, [data, isLoading, error, caseId, pathname]);

  return (
    <DossieBookContext.Provider value={value}>
      {children}
    </DossieBookContext.Provider>
  );
}

export function buildBookSequence(
  caseId: string,
  data: DossierTimelineResponse,
): BookPage[] {
  const pages: BookPage[] = [];

  // Page 1: Overview
  pages.push({
    type: "overview",
    href: `/radar/dossie/${caseId}`,
    label: "Visao Geral",
  });

  // Group signals by typology
  const byTypology = new Map<string, TimelineSignalDTO[]>();
  for (const signal of data.signals) {
    if (!signal.typology_code) continue;
    const existing = byTypology.get(signal.typology_code);
    if (existing) {
      existing.push(signal);
    } else {
      byTypology.set(signal.typology_code, [signal]);
    }
  }

  // Sort chapters by severity (critical first), then by code
  const sortedChapters = [...byTypology.entries()]
    .map(([code, sigs]) => {
      const maxSev = sigs.reduce<SignalSeverity>((max, s) => {
        return (SEVERITY_ORDER[s.severity] ?? 3) < (SEVERITY_ORDER[max] ?? 3)
          ? s.severity
          : max;
      }, "low");
      return [code, sigs, maxSev] as const;
    })
    .sort(([codeA, , sevA], [codeB, , sevB]) => {
      const diff = (SEVERITY_ORDER[sevA] ?? 3) - (SEVERITY_ORDER[sevB] ?? 3);
      if (diff !== 0) return diff;
      return codeA.localeCompare(codeB);
    });

  for (const [code, signals, maxSeverity] of sortedChapters) {
    // Chapter page
    pages.push({
      type: "chapter",
      href: `/radar/dossie/${caseId}/capitulo/${code}`,
      label: `Capitulo ${code}`,
      typologyCode: code,
      severity: maxSeverity,
    });

    // Signal pages within this chapter, sorted by confidence desc
    const sortedSignals = [...signals].sort(
      (a, b) => b.confidence - a.confidence,
    );
    for (const signal of sortedSignals) {
      pages.push({
        type: "signal",
        href: `/radar/dossie/${caseId}/sinal/${signal.id}`,
        label: signal.title,
        signalId: signal.id,
        typologyCode: code,
      });
    }
  }

  return pages;
}
