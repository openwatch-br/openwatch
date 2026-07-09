"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getRadarV2Signals } from "@/lib/api";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { relativeTime, formatDateTime } from "@/lib/utils";
import { TYPOLOGY_LABELS } from "@/lib/constants";
import { confInBand, type RadarFilters } from "../filters";
import { RadarPagination } from "./RadarPagination";
import { RadarTableHeader, SEV_LABEL, PAGE_SIZE, SIGNALS_GRID } from "./radarTableShared";

const SIGNAL_COLUMNS = [
  { label: "" },
  { label: "Sinal" },
  { label: "Severidade", accent: true },
  { label: "Confiança" },
  { label: "Atualizado", align: "right" as const },
];

interface RadarSignalsTableProps {
  filters: RadarFilters;
  confBand: string;
  /** Registro bruto — denser, id-forward monospace presentation. */
  raw?: boolean;
}

export function RadarSignalsTable({ filters, confBand, raw = false }: RadarSignalsTableProps) {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["radar-signals", filters, offset],
    queryFn: () =>
      getRadarV2Signals({
        offset,
        limit: PAGE_SIZE,
        sort: "ingestion_date",
        severity: filters.severity || undefined,
        typology: filters.typology || undefined,
        period_from: filters.periodFrom || undefined,
        period_to: filters.periodTo || undefined,
        corruption_type: filters.corruptionType || undefined,
        sphere: filters.sphere || undefined,
        uf: filters.uf || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
      </div>
    );
  }
  if (isError) {
    return <EmptyState title="Erro ao carregar" description="Não foi possível obter os sinais." />;
  }

  const rows = (data?.items ?? []).filter((s) => confInBand(s.confidence, confBand));
  if (rows.length === 0) {
    return <EmptyState title="Nenhum sinal" description="Nenhum sinal corresponde a este recorte." />;
  }

  return (
    <div>
      <RadarTableHeader columns={SIGNAL_COLUMNS} grid={SIGNALS_GRID} />
      {rows.map((s) => (
        <Link
          key={s.id}
          href={`/signal/${s.id}`}
          className={`grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-b border-[var(--color-border-subtle)] px-5 py-3 transition-colors hover:bg-[var(--color-surface)] sm:items-center sm:gap-0 sm:py-0 sm:min-h-[52px] ${SIGNALS_GRID}`}
        >
          <span className="hidden font-mono text-[11px] text-[var(--color-text-3)] sm:block">
            {s.typology_code}
          </span>
          <div className="min-w-0 sm:py-2 sm:pr-3">
            <div className={raw ? "truncate font-mono text-xs text-[var(--color-text)]" : "truncate text-[13.5px] font-semibold text-[var(--color-text)]"}>
              {raw ? `${s.id.slice(0, 8)} · ${s.title}` : s.title}
            </div>
            <div className="mt-0.5 truncate font-mono text-[10.5px] text-[var(--color-text-3)]">
              {TYPOLOGY_LABELS[s.typology_code] ?? s.typology_name} · {s.entity_count} entid · {s.event_count} eventos
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 sm:justify-self-start"
            style={{ color: `var(--color-${s.severity})` }}
          >
            <SeverityGlyph severity={s.severity} size="sm" />
            <span className="text-xs font-semibold">{SEV_LABEL[s.severity]}</span>
          </span>
          <span className="sm:justify-self-start">
            <ConfidenceBadge score={s.confidence} />
          </span>
          <span className="font-mono text-[11.5px] text-[var(--color-text-3)] sm:text-right">
            {raw ? formatDateTime(s.created_at) : relativeTime(s.created_at)}
          </span>
        </Link>
      ))}
      <RadarPagination offset={offset} pageSize={PAGE_SIZE} total={data?.total ?? 0} onOffset={setOffset} />
    </div>
  );
}
