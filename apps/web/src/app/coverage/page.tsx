"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoverageV2Sources, getCoverageV2Summary } from "@/lib/api";
import { getPipelineCapacity } from "@/lib/operatorApiClient";
import type { CoverageStatus, CoverageV2SourceItem } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { HealthSummaryStrip } from "@/features/coverage/components/HealthSummaryStrip";
import { FreshnessMap } from "@/features/coverage/components/FreshnessMap";
import { FailedRunDetail } from "@/features/coverage/components/FailedRunDetail";
import { SourceDetailModal } from "@/features/coverage/components/SourceDetailModal";
import { PipelineExecutionModal } from "@/features/coverage/components/PipelineExecutionModal";
import { PipelineOperationsPanel } from "@/features/coverage/components/PipelineOperationsPanel";
import { useSourceRunHistory } from "@/features/coverage/hooks/useSourceRunHistory";
import { statusUrgency } from "@/features/coverage/lib/coverageStatus";
import { Database, Gauge, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/Button";

const CAPACITY_RECOMMENDATION_LABEL: Record<string, string> = {
  idle: "Ocioso — pronto para disparar",
  ingest_active: "Ingestão em andamento",
  er_active: "Resolução de entidades em andamento",
};

const CAPACITY_STAGE_LABEL: Record<string, string> = {
  ingest: "Ingestão",
  entity_resolution: "Resolução de entidades",
  baselines: "Baselines",
  signals: "Sinais",
};

export default function CoveragePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CoverageStatus>("");
  const [selectedConnector, setSelectedConnector] = useState<CoverageV2SourceItem | null>(null);
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["coverage-summary"],
    queryFn: getCoverageV2Summary,
    refetchInterval: 10_000,
  });

  const sources = useQuery({
    queryKey: ["coverage-sources"],
    queryFn: () => getCoverageV2Sources({ limit: 100 }),
    refetchInterval: (query) => {
      const hasRunning = (query.state.data?.items ?? []).some((s) => s.runtime.running_jobs > 0);
      return hasRunning ? 5_000 : 15_000;
    },
  });

  const { data: capacity } = useQuery({
    queryKey: ["coverage-capacity"],
    queryFn: getPipelineCapacity,
  });

  const sourcesItems = useMemo(() => sources.data?.items ?? [], [sources.data]);
  const sourcesLoading = sources.isLoading;

  const connectors = useMemo(() => sourcesItems.map((s) => s.connector), [sourcesItems]);
  const { byConnector: historyByConnector, loading: historyLoading } = useSourceRunHistory(connectors);

  const filteredSources = useMemo(() => {
    return sourcesItems
      .filter((s) => {
        if (statusFilter && s.worst_status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!s.connector_label.toLowerCase().includes(q) && !s.connector.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => statusUrgency(a.worst_status) - statusUrgency(b.worst_status));
  }, [sourcesItems, search, statusFilter]);

  // Focus source for the failed-run-detail panel: the single most urgent
  // source right now (error > stale/warning > pending > ok). Only surfaced
  // once we're not in a plain "everything's ok" state.
  const focusSource = useMemo(() => {
    if (sourcesItems.length === 0) return null;
    const sorted = [...sourcesItems].sort((a, b) => statusUrgency(a.worst_status) - statusUrgency(b.worst_status));
    const worst = sorted[0];
    return worst && worst.worst_status !== "ok" ? worst : null;
  }, [sourcesItems]);

  const focusRun = useMemo(() => {
    if (!focusSource) return null;
    const preview = historyByConnector.get(focusSource.connector);
    if (!preview) return null;
    return preview.recent_runs.find((r) => r.status === "error" || r.status === "failed" || r.is_stuck)
      ?? preview.recent_runs[0]
      ?? null;
  }, [focusSource, historyByConnector]);

  return (
    <div className="ow-mode-working ow-content">
      <PageHeader
        eyebrow="COBERTURA"
        title="O mapa de frescor"
        description={
          summary?.snapshot_at
            ? `Snapshot: ${new Date(summary.snapshot_at).toLocaleString("pt-BR")} · até quando os dados vão, e onde há buraco`
            : "Até quando os dados vão, e onde há buraco — janela de 30 dias"
        }
        variant="hero"
        icon={<Database className="h-5 w-5" />}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["coverage"] })}
            disabled={summaryLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
        }
      />

      <div className="space-y-6 animate-fade-in py-6">
        {/* ── Health summary + freshness map (headline) ───────────── */}
        <div className="ow-card overflow-hidden">
          <HealthSummaryStrip sources={sourcesItems} loading={summaryLoading && sourcesLoading} />

          <div className="flex flex-wrap items-center gap-2 border-t border-b px-5 py-3" style={{ borderColor: "var(--color-border)" }}>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors focus-within:border-[var(--color-border-strong)]" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-text-3)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fonte..."
                className="w-36 bg-transparent text-caption outline-none"
                style={{ color: "var(--color-text)" }}
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | CoverageStatus)}
              className="rounded-lg border px-3 py-1.5 text-caption outline-none"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
            >
              <option value="">Todos os status</option>
              <option value="ok">OK</option>
              <option value="warning">Atenção</option>
              <option value="stale">Defasado</option>
              <option value="error">Erro</option>
              <option value="pending">Pendente</option>
            </select>
            {(search.trim() || statusFilter) && (
              <span className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                {filteredSources.length} de {sourcesItems.length} fontes
              </span>
            )}
            <span className="ml-auto text-mono-xs" style={{ color: "var(--color-text-3)" }}>
              janela: últimos 30 dias
            </span>
          </div>

          <FreshnessMap
            sources={filteredSources}
            historyByConnector={historyByConnector}
            loading={sourcesLoading}
            onSelectSource={setSelectedConnector}
          />

          {focusSource && (
            <FailedRunDetail source={focusSource} run={focusRun} />
          )}
        </div>

        {/* ── Secondary: pipeline operations ───────────────────────── */}
        {!summaryLoading && summary && (
          <PipelineOperationsPanel
            summary={summary}
            sourcesItems={sourcesItems}
            onOpenPipelineModal={() => setPipelineModalOpen(true)}
          />
        )}

        {capacity && (
          <section className="ow-card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Gauge className="h-4 w-4" style={{ color: "var(--color-text-3)" }} />
              <p className="text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
                Capacidade do pipeline
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: "var(--color-border)" }}>
              <div className="flex flex-col gap-1 p-4" style={{ background: "var(--color-canvas)" }}>
                <span className="text-mono text-xl font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
                  {capacity.running_ingest_jobs}
                  <span className="text-sm font-normal" style={{ color: "var(--color-text-3)" }}> / {capacity.max_concurrent_ingest}</span>
                </span>
                <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>jobs de ingestão</span>
              </div>
              <div className="flex flex-col gap-1 p-4" style={{ background: "var(--color-canvas)" }}>
                <span className="flex items-center gap-1.5 text-mono text-xl font-bold" style={{ color: capacity.er_running ? "var(--color-status-warning)" : "var(--color-text)" }}>
                  <StatusDot size="sm" status={capacity.er_running ? "warning" : "pending"} pulse={capacity.er_running} />
                  {capacity.er_running ? "Ativa" : "Ociosa"}
                </span>
                <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>resolução de entidades</span>
              </div>
              <div className="flex flex-col gap-1 p-4" style={{ background: "var(--color-canvas)" }}>
                <span className="text-mono text-xl font-bold tabular-nums" style={{ color: capacity.slots_available > 0 ? "var(--color-status-ok)" : "var(--color-text-3)" }}>
                  {capacity.slots_available}
                </span>
                <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>slots livres</span>
              </div>
              <div className="flex flex-col gap-1 p-4" style={{ background: "var(--color-canvas)" }}>
                <span className="text-[13px] font-semibold leading-snug" style={{ color: "var(--color-text)" }}>
                  {CAPACITY_RECOMMENDATION_LABEL[capacity.recommendation] ?? capacity.recommendation}
                </span>
                <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>recomendação</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
              {Object.entries(capacity.can_dispatch).map(([stage, allowed]) => (
                <span
                  key={stage}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-mono-xs"
                  style={{
                    borderColor: allowed ? "var(--color-low-border)" : "var(--color-border)",
                    background: allowed ? "var(--color-low-bg)" : "transparent",
                    color: allowed ? "var(--color-low-text)" : "var(--color-text-3)",
                  }}
                >
                  <StatusDot size="sm" status={allowed ? "ok" : "pending"} />
                  {CAPACITY_STAGE_LABEL[stage] ?? stage}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedConnector && (
        <SourceDetailModal
          item={selectedConnector}
          preview={historyByConnector.get(selectedConnector.connector)}
          loading={historyLoading}
          onClose={() => setSelectedConnector(null)}
        />
      )}

      <PipelineExecutionModal open={pipelineModalOpen} onClose={() => setPipelineModalOpen(false)} />
    </div>
  );
}
