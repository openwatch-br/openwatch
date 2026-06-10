"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getRadarV2Cases,
  getRadarV2Summary,
} from "@/lib/api";
import type {
  RadarV2CaseItem,
  RadarV2SummaryResponse,
} from "@/lib/types";
import { SeverityBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { StatHero } from "@/components/StatHero";
import { FilterChips } from "@/components/FilterChips";
import type { FilterChipOption } from "@/components/FilterChips";
import {
  ChevronRight, ChevronLeft, Search,
  Radar, AlertTriangle, SlidersHorizontal, X,
} from "lucide-react";
import { relativeTime, formatDate } from "@/lib/utils";
import { TYPOLOGY_LABELS } from "@/lib/constants";

const PAGE_SIZE = 20;
const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;
type SeverityLevel = (typeof SEVERITY_ORDER)[number];

const SEV_COLORS: Record<SeverityLevel, string> = {
  critical: "var(--color-critical)",
  high:     "var(--color-high)",
  medium:   "var(--color-medium)",
  low:      "var(--color-low)",
};

const SEV_LABELS: Record<SeverityLevel, string> = {
  critical: "Crítico",
  high:     "Alto",
  medium:   "Médio",
  low:      "Baixo",
};

/* ── Case Card ──────────────────────────────────────────────────── */
function CaseCard({ item }: { item: RadarV2CaseItem }) {
  const color = SEV_COLORS[item.severity as SeverityLevel] ?? "var(--color-text-3)";
  const codes = item.typology_codes ?? [];

  const period =
    item.period_start && item.period_end
      ? `${formatDate(item.period_start)} – ${formatDate(item.period_end)}`
      : item.period_start
      ? `a partir de ${formatDate(item.period_start)}`
      : null;

  return (
    <Link
      href={`/radar/dossie/${item.id}`}
      className="ow-card ow-card-hover block group"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="ow-card-section space-y-3">
        {/* Title + severity */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-body font-semibold text-[var(--color-text)] truncate-2 group-hover:text-[var(--color-brand)] transition-colors">
            {item.title}
          </h3>
          <SeverityBadge severity={item.severity as SeverityLevel} />
        </div>

        {/* Summary */}
        {item.summary && (
          <p className="text-xs text-[var(--color-text-3)] leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        )}

        {/* Signals list */}
        {codes.length > 0 && (
          <ul className="space-y-1">
            {codes.slice(0, 3).map((code) => (
              <li key={code} className="flex items-center gap-2 text-xs text-[var(--color-text-3)]">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="font-mono text-[10px] text-[var(--color-text-3)] mr-0.5 shrink-0">{code}</span>
                <span className="truncate">{TYPOLOGY_LABELS[code] ?? "—"}</span>
              </li>
            ))}
            {codes.length > 3 && (
              <li className="text-xs text-[var(--color-text-3)] pl-3.5">
                +{codes.length - 3} sinal{codes.length - 3 > 1 ? "is" : ""}
              </li>
            )}
          </ul>
        )}

        {/* Footer */}
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap pt-2 border-t border-[var(--color-border)] text-[var(--color-text-3)]">
          {item.signal_count > 0 && (
            <span className="text-caption">
              {item.signal_count} sinal{item.signal_count > 1 ? "is" : ""}
            </span>
          )}
          {item.entity_count > 0 && (
            <span className="text-caption">{item.entity_count} entidades</span>
          )}
          {period && (
            <span className="text-mono-xs hidden sm:inline">{period}</span>
          )}
          <span className="text-mono-xs ml-auto">{relativeTime(item.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Case List (flat, filtered by severity chip) ────────────────── */
function CaseList({
  severity,
  filters,
  search,
}: {
  severity: string;
  filters: Record<string, string>;
  search: string;
}) {
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<RadarV2CaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filterKey = JSON.stringify(filters) + severity;

  useEffect(() => { setOffset(0); }, [filterKey]);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    getRadarV2Cases({
      severity: severity || undefined,
      offset,
      limit: PAGE_SIZE,
      typology: filters.typology || undefined,
      period_from: filters.periodFrom || undefined,
      period_to: filters.periodTo || undefined,
    })
      .then((data) => {
        if (ctrl.signal.aborted) return;
        setTotal(data.total);
        setItems(data.items as RadarV2CaseItem[]);
      })
      .catch(() => { if (!ctrl.signal.aborted) setError("Erro ao carregar dados."); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, [offset, filterKey, severity, filters.typology, filters.periodFrom, filters.periodTo]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const filtered = search.trim()
    ? items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
    : items;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="ow-alert ow-alert-error">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
        {error}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="Nenhum caso encontrado"
        description={search ? "Tente outros termos de busca." : "Nenhum caso com os filtros aplicados."}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((item) => <CaseCard key={item.id} item={item} />)}
      </div>

      {/* Pagination */}
      {!search && totalPages > 1 && (
        <div className="ow-pagination mt-4">
          <span className="ow-pagination-info">
            pág. {currentPage}/{totalPages} — {total} total
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={currentPage <= 1}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
              <ChevronLeft size={14} />
              Anterior
            </Button>
            <Button variant="ghost" size="sm" disabled={currentPage >= totalPages}
              onClick={() => setOffset(offset + PAGE_SIZE)}>
              Próxima
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
function RadarPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typology     = searchParams.get("typology") || "";
  const severity     = searchParams.get("severity") || "";
  const periodFrom   = searchParams.get("period_from") || "";
  const periodTo     = searchParams.get("period_to") || "";
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [summary, setSummary] = useState<RadarV2SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const updateParam = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v); else params.delete(k);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const hasFilters = !!(typology || severity || periodFrom || periodTo);
  const filters = { typology, periodFrom, periodTo };

  useEffect(() => {
    setSummaryLoading(true);
    getRadarV2Summary({
      typology: typology || undefined,
      period_from: periodFrom || undefined,
      period_to: periodTo || undefined,
    })
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [typology, periodFrom, periodTo]);

  const totalSignals = summary?.totals?.signals ?? 0;
  const totalCases = summary?.totals?.cases ?? 0;
  const criticalCount = summary?.severity_counts?.critical ?? 0;

  // Only show typologies present in current data, sorted by count desc
  const presentTypologies = (summary?.typology_counts ?? [])
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const detectorCount = presentTypologies.length;
  const hasPeriodFilter = !!(periodFrom || periodTo);

  const severityChips: FilterChipOption[] = [
    { id: "", label: "Todos", count: totalCases },
    ...SEVERITY_ORDER.filter((sev) => (summary?.severity_counts?.[sev] ?? 0) > 0).map((sev) => ({
      id: sev,
      label: SEV_LABELS[sev],
      count: summary?.severity_counts?.[sev] ?? 0,
      color: SEV_COLORS[sev],
    })),
  ];

  const typologyChips: FilterChipOption[] = presentTypologies.map((t) => ({
    id: t.code,
    label: t.name,
    count: t.count,
  }));

  return (
    <div className="ow-content">
      {/* Hero */}
      <StatHero
        label="Sinais de risco detectados"
        value={summaryLoading ? "—" : totalSignals.toLocaleString("pt-BR")}
        subtitle="todos os indícios de todos os detectores"
        stats={[
          { value: summaryLoading ? "—" : totalCases.toLocaleString("pt-BR"), label: "Casos", tone: "neutral" },
          { value: summaryLoading ? "—" : criticalCount.toLocaleString("pt-BR"), label: "Críticos", tone: "critical" },
          { value: summaryLoading ? "—" : String(detectorCount), label: "Detectores", tone: "neutral" },
        ]}
        actions={
          hasFilters ? (
            <button
              onClick={() => router.replace("/radar", { scroll: false })}
              className="ow-btn ow-btn-ghost ow-btn-sm gap-1 !text-[var(--color-critical-text)]"
            >
              <X size={13} />
              Limpar filtros
            </button>
          ) : undefined
        }
      />

      {/* Severity chips */}
      <div className="mb-3">
        <FilterChips
          aria-label="Filtrar por severidade"
          options={severityChips}
          value={severity}
          onChange={(id) => updateParam({ severity: id })}
        />
      </div>

      {/* Typology chips */}
      {typologyChips.length > 0 && (
        <div className="mb-4">
          <FilterChips
            aria-label="Filtrar por tipologia"
            options={typologyChips}
            value={typology}
            onChange={(id) => updateParam({ typology: id === typology ? "" : id })}
          />
        </div>
      )}

      {/* Search + period bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Input
          iconLeft={<Search size={14} />}
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`ow-btn ow-btn-sm gap-1.5 shrink-0 ${filtersOpen || hasPeriodFilter ? "ow-btn-amber" : "ow-btn-ghost"}`}
        >
          <SlidersHorizontal size={14} />
          Período
          {hasPeriodFilter && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        </button>
      </div>

      {/* Period filter panel */}
      {filtersOpen && (
        <div className="ow-card ow-card-section mb-3 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ow-label">De</label>
              <input
                type="date"
                className="ow-input"
                value={periodFrom}
                onChange={(e) => updateParam({ period_from: e.target.value })}
              />
            </div>
            <div>
              <label className="ow-label">Até</label>
              <input
                type="date"
                className="ow-input"
                value={periodTo}
                onChange={(e) => updateParam({ period_to: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Flat case list */}
      {summaryLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
        </div>
      ) : totalCases === 0 ? (
        <EmptyState
          icon={<Radar size={40} />}
          title="Nenhum resultado"
          description="Nenhum item encontrado com os filtros aplicados. Tente remover alguns filtros."
          action={
            <button
              onClick={() => router.replace("/radar", { scroll: false })}
              className="ow-btn ow-btn-outline ow-btn-sm"
            >
              Limpar Filtros
            </button>
          }
        />
      ) : (
        <CaseList severity={severity} filters={filters} search={search} />
      )}
    </div>
  );
}

export default function RadarPage() {
  return (
    <Suspense fallback={
      <div className="ow-content space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} rows={2} />
        ))}
      </div>
    }>
      <RadarPageInner />
    </Suspense>
  );
}
