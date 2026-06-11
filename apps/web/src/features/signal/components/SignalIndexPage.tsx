"use client";

// Índice de sinais (doc §3.4, passo 1): lista paginada com filtros por
// tipologia, severidade, UF e período; estado na URL p/ deep links.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { IndicioDisclaimer } from "@/components/IndicioDisclaimer";
import { getRadarV2Signals } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { SignalFilters, type SignalFilterValues } from "./SignalFilters";

const PAGE_SIZE = 25;

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-[var(--color-sev-critical,#FF5C5C)]/15 text-[var(--color-sev-critical,#FF5C5C)]",
  high: "bg-[var(--color-sev-high,#F5A623)]/15 text-[var(--color-sev-high,#F5A623)]",
  medium: "bg-[var(--color-sev-medium,#5CA8FF)]/15 text-[var(--color-sev-medium,#5CA8FF)]",
  low: "bg-[var(--color-sev-low,#6E6E78)]/15 text-[var(--color-sev-low,#6E6E78)]",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

function SignalIndexInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: SignalFilterValues = {
    typology: searchParams.get("typology") ?? "",
    severity: searchParams.get("severity") ?? "",
    uf: searchParams.get("uf") ?? "",
    period_from: searchParams.get("from") ?? "",
    period_to: searchParams.get("to") ?? "",
  };
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const setParams = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      router.replace(`/signal?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const onFilterChange = useCallback(
    (next: Partial<SignalFilterValues>) => {
      setParams({
        ...(next.typology !== undefined && { typology: next.typology }),
        ...(next.severity !== undefined && { severity: next.severity }),
        ...(next.uf !== undefined && { uf: next.uf }),
        ...(next.period_from !== undefined && { from: next.period_from }),
        ...(next.period_to !== undefined && { to: next.period_to }),
        page: "", // reset paginação ao mudar filtro
      });
    },
    [setParams],
  );

  const query = useQuery({
    queryKey: ["signal-index", filters, page],
    queryFn: () =>
      getRadarV2Signals({
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        ...(filters.typology && { typology: filters.typology }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.uf && { uf: filters.uf }),
        ...(filters.period_from && { period_from: filters.period_from }),
        ...(filters.period_to && { period_to: filters.period_to }),
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-primary">Sinais</h1>
        <p className="text-xs text-muted">
          Indícios estatísticos detectados pelas tipologias — filtre por tipologia, severidade, UF e período.
        </p>
      </header>

      <IndicioDisclaimer />

      <SignalFilters values={filters} onChange={onFilterChange} />

      <div className="space-y-2">
        {query.isLoading && <p className="py-8 text-center text-xs text-muted">Carregando sinais…</p>}
        {query.isError && (
          <p className="py-8 text-center text-xs text-[var(--color-sev-critical,#FF5C5C)]">
            Erro ao carregar sinais. Tente novamente.
          </p>
        )}
        {query.data?.items?.length === 0 && (
          <p className="py-8 text-center text-xs text-muted">Nenhum sinal encontrado p/ os filtros.</p>
        )}

        {(query.data?.items ?? []).map((s) => (
          <Link
            key={s.id}
            href={`/signal/${s.id}`}
            className="block rounded-xl border border-border bg-surface-card p-4 transition-colors hover:border-accent/40"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-muted">{s.typology_code}</span>
              <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLE[s.severity] ?? "")}>
                {SEVERITY_LABEL[s.severity] ?? s.severity}
              </span>
              <span className="text-[10px] text-muted">{s.typology_name}</span>
              {s.period_end && (
                <span className="ml-auto text-[10px] text-muted">{formatDate(s.period_end)}</span>
              )}
            </div>
            <p className="text-sm font-medium text-primary">{s.title}</p>
            {s.summary && <p className="mt-1 line-clamp-2 text-xs text-muted">{s.summary}</p>}
            <div className="mt-2 flex gap-3 font-mono text-[10px] text-muted">
              <span>{s.entity_count} entidade(s)</span>
              <span>{s.event_count} evento(s)</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Paginação */}
      {total > PAGE_SIZE && (
        <nav className="flex items-center justify-between text-xs text-muted">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setParams({ page: String(page - 1) })}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span>
            Página {page} de {totalPages} · {total} sinais
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setParams({ page: String(page + 1) })}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Próxima →
          </button>
        </nav>
      )}
    </div>
  );
}

export default function SignalIndexPage() {
  return (
    <Suspense>
      <SignalIndexInner />
    </Suspense>
  );
}
