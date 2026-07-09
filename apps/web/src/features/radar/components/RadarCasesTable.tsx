"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getRadarV2Cases, getRadarV2CaseBatchPreview } from "@/lib/api";
import type { SignalSeverity } from "@/lib/types";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { formatBRLCompact, relativeTime } from "@/lib/utils";
import { confInBand, type RadarFilters } from "../filters";
import { RadarPagination } from "./RadarPagination";
import { RadarTableHeader, SEV_LABEL, PAGE_SIZE, CASES_GRID } from "./radarTableShared";

const CASE_COLUMNS = [
  { label: "" },
  { label: "Caso" },
  { label: "Severidade", accent: true },
  { label: "Confiança" },
  { label: "Valor", align: "right" as const },
  { label: "Atualizado", align: "right" as const },
];

interface CaseRow {
  id: string;
  code: string | null;
  title: string;
  org: string | null;
  entities: string;
  severity: SignalSeverity;
  confidence: number | null;
  value: number | null;
  updated: string;
}

async function loadCases(filters: RadarFilters, offset: number): Promise<{ rows: CaseRow[]; total: number }> {
  const { items, total } = await getRadarV2Cases({
    offset,
    limit: PAGE_SIZE,
    severity: filters.severity || undefined,
    typology: filters.typology || undefined,
    period_from: filters.periodFrom || undefined,
    period_to: filters.periodTo || undefined,
    corruption_type: filters.corruptionType || undefined,
    sphere: filters.sphere || undefined,
  });

  const previews = await getRadarV2CaseBatchPreview(items.map((c) => c.id));
  const rows = items.map((c): CaseRow => {
    const p = previews[c.id];
    const confidences = (p?.top_signals ?? [])
      .map((s) => s.confidence)
      .filter((n): n is number => typeof n === "number");
    return {
      id: c.id,
      code: c.typology_codes?.[0] ?? null,
      title: c.title,
      org: p?.case.entity_names?.[0] ?? null,
      entities: c.entity_count > 0 ? `${c.entity_count} entidades` : "—",
      severity: c.severity,
      confidence: confidences.length ? Math.max(...confidences) : null,
      value: p?.case.total_value_brl ?? null,
      updated: relativeTime(c.created_at),
    };
  });
  return { rows, total };
}

interface RadarCasesTableProps {
  filters: RadarFilters;
  confBand: string;
}

export function RadarCasesTable({ filters, confBand }: RadarCasesTableProps) {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["radar-cases", filters, offset],
    queryFn: () => loadCases(filters, offset),
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
    return <EmptyState title="Erro ao carregar" description="Não foi possível obter os casos." />;
  }

  const rows = (data?.rows ?? []).filter((r) => confInBand(r.confidence, confBand));
  if (rows.length === 0) {
    return <EmptyState title="Nenhum caso" description="Nenhum caso corresponde a este recorte." />;
  }

  return (
    <div>
      <RadarTableHeader columns={CASE_COLUMNS} grid={CASES_GRID} />
      {rows.map((r) => (
        <Link
          key={r.id}
          href={`/radar/dossie/${r.id}`}
          className={`grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-b border-[var(--color-border-subtle)] px-5 py-3 transition-colors hover:bg-[var(--color-surface)] sm:items-center sm:gap-0 sm:py-0 sm:min-h-[52px] ${CASES_GRID}`}
        >
          <span className="hidden font-mono text-[11px] text-[var(--color-text-3)] sm:block">
            {r.code}
          </span>
          <div className="min-w-0 sm:py-2 sm:pr-3">
            <div className="truncate text-[13.5px] font-semibold text-[var(--color-text)]">{r.title}</div>
            <div className="mt-0.5 truncate font-mono text-[10.5px] text-[var(--color-text-3)]">
              {r.org ? `${r.org} · ` : ""}{r.entities}
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 sm:justify-self-start"
            style={{ color: `var(--color-${r.severity})` }}
          >
            <SeverityGlyph severity={r.severity} size="sm" />
            <span className="text-xs font-semibold">{SEV_LABEL[r.severity]}</span>
          </span>
          <span className="sm:justify-self-start">
            {r.confidence != null ? <ConfidenceBadge score={r.confidence} /> : <span className="text-[var(--color-text-3)]">—</span>}
          </span>
          <span className="font-mono text-xs text-[var(--color-text-2)] sm:text-right">
            {r.value != null ? formatBRLCompact(r.value) : "—"}
          </span>
          <span className="font-mono text-[11.5px] text-[var(--color-text-3)] sm:text-right">{r.updated}</span>
        </Link>
      ))}
      <RadarPagination offset={offset} pageSize={PAGE_SIZE} total={data?.total ?? 0} onOffset={setOffset} />
    </div>
  );
}
