"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoverageV2Sources, getCoverageV2Summary } from "@/lib/api";
import { getPipelineCapacity } from "@/lib/operatorApiClient";
import type { CoverageStatus, CoverageV2SourceItem } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { HealthSummaryStrip } from "@/features/coverage/components/HealthSummaryStrip";
import { FreshnessMap } from "@/features/coverage/components/FreshnessMap";
import { FailedRunDetail } from "@/features/coverage/components/FailedRunDetail";
import { SourceDetailModal } from "@/features/coverage/components/SourceDetailModal";
import { PipelineExecutionModal } from "@/features/coverage/components/PipelineExecutionModal";
import { PipelineOperationsPanel } from "@/features/coverage/components/PipelineOperationsPanel";
import { useSourceRunHistory } from "@/features/coverage/hooks/useSourceRunHistory";
import { statusUrgency } from "@/features/coverage/lib/coverageStatus";
import { Database, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/Button";

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
            <label className="flex items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
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
            <p className="text-mono-xs uppercase tracking-widest mb-4" style={{ color: "var(--color-text-3)" }}>
              Capacidade do pipeline
            </p>
            <div className="ow-strip">
              {Object.entries(capacity).map(([key, val]) => (
                <div key={key} className="ow-strip-item">
                  <span className="ow-strip-value text-mono">{String(val)}</span>
                  <span className="ow-strip-label">{key.replace(/_/g, " ")}</span>
                </div>
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
