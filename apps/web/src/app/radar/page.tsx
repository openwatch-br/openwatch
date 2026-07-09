"use client";

import { Suspense, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getRadarV2Summary } from "@/lib/api";
import { formatNumber, relativeTime } from "@/lib/utils";
import { SkeletonCard } from "@/components/Skeleton";
import { RadarQuerySentence } from "@/features/radar/components/RadarQuerySentence";
import { RadarFacets } from "@/features/radar/components/RadarFacets";
import { RadarCasesTable } from "@/features/radar/components/RadarCasesTable";
import { RadarSignalsTable } from "@/features/radar/components/RadarSignalsTable";
import {
  EMPTY_FILTERS,
  type RadarFilters,
  type RadarView,
  type FilterKey,
} from "@/features/radar/filters";

function RadarPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const view = (params.get("view") as RadarView) || "cases";
  const confBand = params.get("conf") || "";
  const filters: RadarFilters = {
    ...EMPTY_FILTERS,
    severity: params.get("severity") || "",
    typology: params.get("typology") || "",
    corruptionType: params.get("corruption_type") || "",
    sphere: params.get("sphere") || "",
    uf: params.get("uf") || "",
    periodFrom: params.get("period_from") || "",
    periodTo: params.get("period_to") || "",
  };

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, params],
  );

  // Filter-panel patch → URL params (facet keys map to API param names).
  const applyPatch = useCallback(
    (patch: Partial<RadarFilters>) => {
      const map: Record<keyof RadarFilters, string> = {
        severity: "severity",
        typology: "typology",
        corruptionType: "corruption_type",
        sphere: "sphere",
        uf: "uf",
        periodFrom: "period_from",
        periodTo: "period_to",
      };
      const updates: Record<string, string> = {};
      for (const [k, v] of Object.entries(patch)) {
        updates[map[k as keyof RadarFilters]] = v ?? "";
      }
      setParams(updates);
    },
    [setParams],
  );

  const removeChip = useCallback(
    (key: FilterKey) => {
      if (key === "period") applyPatch({ periodFrom: "", periodTo: "" });
      else applyPatch({ [key]: "" } as Partial<RadarFilters>);
    },
    [applyPatch],
  );

  const summaryFilters = {
    typology: filters.typology || undefined,
    period_from: filters.periodFrom || undefined,
    period_to: filters.periodTo || undefined,
    corruption_type: filters.corruptionType || undefined,
    sphere: filters.sphere || undefined,
  };

  const { data: summary } = useQuery({
    queryKey: ["radar-summary", summaryFilters],
    queryFn: () => getRadarV2Summary(summaryFilters),
  });

  const totalCases = summary?.totals?.cases ?? 0;
  const totalSignals = summary?.totals?.signals ?? 0;
  const countLabel =
    view === "cases"
      ? `${formatNumber(totalCases)} casos`
      : `${formatNumber(totalSignals)} sinais`;
  const snapshotLabel = summary?.snapshot_at
    ? `atualizado ${relativeTime(summary.snapshot_at)}`
    : "—";

  const saveRecorte = useCallback(() => {
    if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
      toast.success("Recorte copiado — cole a URL para compartilhar.");
    }
  }, []);

  return (
    <div className="ow-mode-working mx-auto w-full max-w-[1440px]">
      <RadarQuerySentence
        view={view}
        onViewChange={(v) => setParams({ view: v === "cases" ? "" : v })}
        filters={filters}
        onSet={applyPatch}
        onRemove={removeChip}
        countLabel={countLabel}
        snapshotLabel={snapshotLabel}
        onSaveRecorte={saveRecorte}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[var(--color-border-subtle)] px-5 py-5 lg:border-b-0 lg:border-r">
          <RadarFacets
            severityCounts={summary?.severity_counts}
            activeSeverity={filters.severity}
            onSeverity={(sev) => applyPatch({ severity: sev })}
            typologies={summary?.typology_counts ?? []}
            activeTypology={filters.typology}
            onTypology={(code) => applyPatch({ typology: code })}
            confBand={confBand}
            onConfBand={(band) => setParams({ conf: band })}
            showConfidence
          />
        </aside>

        <div className="min-w-0">
          {view === "cases" ? (
            <RadarCasesTable filters={filters} confBand={confBand} />
          ) : (
            <RadarSignalsTable filters={filters} confBand={confBand} raw={view === "raw"} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function RadarPage() {
  return (
    <Suspense
      fallback={
        <div className="ow-content space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} rows={2} />
          ))}
        </div>
      }
    >
      <RadarPageInner />
    </Suspense>
  );
}
