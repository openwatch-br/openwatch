"use client";

import { useMemo } from "react";
import { FitaRadar } from "@/features/dashboard/components/FitaRadar";
import { HomeWorklist } from "@/features/dashboard/components/HomeWorklist";
import { SourceIntegrityRail } from "@/features/dashboard/components/SourceIntegrityRail";
import { TypologyActivityRail } from "@/features/dashboard/components/TypologyActivityRail";
import { IndicioNote } from "@/features/dashboard/components/IndicioNote";
import { useHomeData } from "@/features/dashboard/useHomeData";
import { buildSeismograph, countRecent } from "@/features/dashboard/helpers";
import { formatNumber } from "@/lib/utils";

export default function HomePage() {
  const { summary, seismoSignals, worklist, sources, seismoDays } = useHomeData();

  const ticks = useMemo(
    () => buildSeismograph(seismoSignals.data?.items ?? [], seismoDays),
    [seismoSignals.data, seismoDays],
  );

  const counts = summary.data?.severity_counts;
  const totals = summary.data?.totals;

  const stats = [
    { value: formatNumber(counts?.critical ?? 0), label: "críticos", tone: "critical" as const },
    { value: formatNumber(counts?.high ?? 0), label: "altos", tone: "high" as const },
    { value: formatNumber(totals?.cases ?? 0), label: "casos ativos", tone: "neutral" as const },
  ];

  return (
    <div className="ow-mode-working mx-auto w-full max-w-[1440px]">
      <FitaRadar
        totalSignals={totals?.signals ?? 0}
        recent7={countRecent(ticks, 7)}
        ticks={ticks}
        stats={stats}
        days={seismoDays}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
        <HomeWorklist
          items={worklist.data ?? []}
          loading={worklist.isLoading}
          error={worklist.isError}
        />

        <aside className="flex flex-col gap-7 px-4 py-6 sm:px-6">
          <SourceIntegrityRail sources={sources.data?.items ?? []} loading={sources.isLoading} />
          <TypologyActivityRail
            typologies={summary.data?.typology_counts ?? []}
            loading={summary.isLoading}
          />
          <IndicioNote />
        </aside>
      </div>
    </div>
  );
}
