"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getIngestRunDetail } from "@/lib/api";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { formatNumber } from "@/lib/utils";
import type { IngestRunDetailResponse } from "@/lib/types";
import { fmtDate } from "@/features/coverage/lib/coverageStatus";
import { stringifyJson } from "@/features/coverage/lib/runDetailFormat";
import { RunFieldProfileTable } from "@/features/coverage/components/run-detail/RunFieldProfileTable";
import { RunSamplesViewer } from "@/features/coverage/components/run-detail/RunSamplesViewer";
import {
  Activity, AlertTriangle, ArrowDownUp, ArrowLeft, BarChart3, CircleX,
  Clock, Copy, Database, Hash, Loader2, MapPin, RefreshCw, Timer, Zap,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: typeof CircleX }> = {
  completed: { label: "Concluído",   color: "var(--color-status-ok)",      bg: "var(--color-low-bg)",      border: "var(--color-low-border)",      Icon: Activity },
  running:   { label: "Em execução", color: "var(--color-brand-text)",     bg: "var(--color-brand-tint)",  border: "var(--color-brand-border)",    Icon: Loader2  },
  yielded:   { label: "Cedeu vez",   color: "var(--color-status-warning)", bg: "var(--color-medium-bg)",   border: "var(--color-medium-border)",   Icon: Clock    },
  failed:    { label: "Falhou",      color: "var(--color-status-error)",   bg: "var(--color-critical-bg)", border: "var(--color-critical-border)", Icon: CircleX  },
  error:     { label: "Erro",        color: "var(--color-status-error)",   bg: "var(--color-critical-bg)", border: "var(--color-critical-border)", Icon: CircleX  },
};

function getStatusCfg(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, color: "var(--color-text-3)", bg: "var(--color-surface-2)", border: "var(--color-border)", Icon: Clock };
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 10000) / 100;
}

function formatDuration(startedAt?: string | null, finishedAt?: string | null): string {
  if (!startedAt) return "—";
  const ms = (finishedAt ? new Date(finishedAt) : new Date()).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}min ${s}s`;
}

function KpiCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: typeof Database }) {
  return (
    <div className="rounded-xl border px-4 py-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-brand-text)" }} />
        <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>{label}</p>
      </div>
      <p className="font-mono text-2xl font-bold leading-none tabular-nums" style={{ color: "var(--color-text)" }}>
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {sub && <p className="mt-1.5 font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>{sub}</p>}
    </div>
  );
}

/**
 * Run detail — the "log completo" destination linked from Cobertura's
 * failed-run panel. Modernized from the pre-rebrand utility classes it
 * shipped with (`text-primary`/`bg-surface-card`/etc. — still functional via
 * legacy alias vars, but inconsistent with the rest of the rebuilt app) and
 * split field-profile / samples into their own components.
 */
export default function CoverageRunDetailPage() {
  const params = useParams<{ id: string }>();
  const runId = params.id;

  const [detail, setDetail] = useState<IngestRunDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchDetail() {
    if (!runId) return;
    setLoading(true);
    setError(null);
    getIngestRunDetail(runId)
      .then(setDetail)
      .catch(() => setError("Não foi possível carregar o detalhe da execução."))
      .finally(() => setLoading(false));
  }

  useEffect(fetchDetail, [runId]);

  useEffect(() => {
    if (detail?.run.status !== "running") return;
    const interval = setInterval(() => {
      if (!runId) return;
      getIngestRunDetail(runId).then(setDetail).catch(() => {});
    }, 5_000);
    return () => clearInterval(interval);
  }, [detail?.run.status, runId]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (detail?.run.status !== "running") return;
    const id = setInterval(() => setNowMs(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [detail?.run.status]);

  const normalizedPct = useMemo(() => (detail ? pct(detail.run.items_normalized, detail.run.items_fetched) : 0), [detail]);
  const dupPct = useMemo(() => (!detail || detail.summary.records_stored === 0 ? 0 : pct(detail.summary.duplicate_raw_ids, detail.summary.records_stored)), [detail]);

  const isRunning = detail?.run.status === "running";
  const isYielded = detail?.run.status === "yielded";
  const startMs = detail?.run.started_at ? new Date(detail.run.started_at).getTime() : 0;
  const liveElapsedMs = startMs > 0 ? nowMs - startMs : 0;
  const liveElapsedStr = isRunning && liveElapsedMs > 0
    ? liveElapsedMs >= 3600_000 ? `${Math.floor(liveElapsedMs / 3600_000)}h ${Math.floor((liveElapsedMs % 3600_000) / 60_000)}min`
    : liveElapsedMs >= 60_000 ? `${Math.floor(liveElapsedMs / 60_000)}min ${Math.floor((liveElapsedMs % 60_000) / 1_000)}s`
    : `${Math.floor(liveElapsedMs / 1_000)}s`
    : null;

  const duration = detail ? formatDuration(detail.run.started_at, detail.run.finished_at) : "—";
  const statusCfg = detail ? getStatusCfg(detail.run.status) : getStatusCfg("running");
  const StatusIcon = statusCfg.Icon;

  if (loading) {
    return (
      <div className="mx-auto max-w-[1180px] space-y-4 px-4 py-8 sm:px-6">
        <div className="h-24 animate-pulse rounded-xl" style={{ background: "var(--color-surface)" }} />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        <PageHeader eyebrow="PIPELINE" title="Detalhe da execução" description="Não foi possível carregar os dados desta execução." variant="hero" icon={<AlertTriangle className="h-5 w-5" />} />
        <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-xl border py-16" style={{ borderColor: "var(--color-critical-border)", background: "var(--color-critical-bg)" }}>
          <AlertTriangle className="h-10 w-10" style={{ color: "var(--color-critical-text)" }} />
          <p className="font-semibold" style={{ color: "var(--color-text)" }}>{error ?? "Detalhe indisponível"}</p>
          <Button onClick={fetchDetail}><RefreshCw className="h-3.5 w-3.5" />Tentar novamente</Button>
        </div>
      </div>
    );
  }

  const displayErrors = detail.run.errors
    ? Object.fromEntries(Object.entries(detail.run.errors).filter(([k]) => !k.startsWith("_") && k !== "yielded"))
    : null;
  const hasDisplayErrors = Boolean(displayErrors && Object.keys(displayErrors).length > 0);
  const isPartial = hasDisplayErrors && (detail.run.errors as Record<string, unknown>).partial === true;
  const isRetryable = hasDisplayErrors && (detail.run.errors as Record<string, unknown>).retryable === true;

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 px-4 py-8 sm:px-6">
      <div>
        <PageHeader
          breadcrumbs={[{ label: "Cobertura", href: "/coverage" }, { label: "Execução" }]}
          eyebrow="PIPELINE"
          title={`${detail.run.connector} / ${detail.run.job}`}
          description="Detalhe operacional da execução, diagnóstico de normalização e amostras processadas."
          variant="hero"
          icon={<Database className="h-5 w-5" />}
          actions={
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-3)" }}>
                <Timer className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{duration}</span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{ borderColor: statusCfg.border, background: statusCfg.bg, color: statusCfg.color }}
              >
                <StatusIcon className={`h-3.5 w-3.5 ${detail.run.status === "running" ? "animate-spin" : ""}`} />
                {statusCfg.label}
              </span>
            </div>
          }
          stats={[
            { label: "Domínio", value: detail.job.domain ?? "—" },
            { label: "Início", value: fmtDate(detail.run.started_at), mono: true },
            { label: "Fim", value: fmtDate(detail.run.finished_at), mono: true },
          ]}
        />
        <Link href="/coverage" className="mt-4 inline-flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--color-brand-text)]" style={{ color: "var(--color-text-3)" }}>
          <ArrowLeft className="h-3 w-3" />
          Voltar para Cobertura
        </Link>
      </div>

      {(isRunning || isYielded) && (
        <section className="space-y-4 rounded-xl border-2 p-5" style={{ borderColor: isRunning ? "var(--color-brand-border)" : "var(--color-medium-border)", background: isRunning ? "var(--color-brand-tint)" : "var(--color-medium-bg)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`h-5 w-5 ${isRunning ? "animate-pulse" : ""}`} style={{ color: isRunning ? "var(--color-brand-text)" : "var(--color-status-warning)" }} />
              <p className="font-display text-sm font-bold" style={{ color: "var(--color-text)" }}>
                {isRunning ? "Execução em andamento" : "Ingestão concluída — normalizando"}
              </p>
            </div>
            {liveElapsedStr && <span className="font-mono text-sm font-bold tabular-nums" style={{ color: "var(--color-brand-text)" }}>{liveElapsedStr}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {detail.run.cursor_info && (
              <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" style={{ color: "var(--color-brand-text)" }} /><p className="font-mono text-[9px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>Posição</p></div>
                <p className="font-mono text-xs font-bold" style={{ color: "var(--color-text)" }}>{detail.run.cursor_info}</p>
              </div>
            )}
            {detail.run.rate_per_min != null && detail.run.rate_per_min > 0 && (
              <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="mb-0.5 flex items-center gap-1"><Zap className="h-3 w-3" style={{ color: "var(--color-brand-text)" }} /><p className="font-mono text-[9px] uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>Velocidade</p></div>
                <p className="font-mono text-xs font-bold" style={{ color: "var(--color-text)" }}>~{Math.round(detail.run.rate_per_min).toLocaleString("pt-BR")}/min</p>
              </div>
            )}
          </div>

          <p className="font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>
            {isRunning ? "Dados atualizados a cada 5 segundos automaticamente." : "A ingestão foi concluída. A normalização processa os dados brutos em eventos estruturados."}
          </p>
        </section>
      )}

      <section>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>Métricas da execução</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={Database} label={isRunning ? "Coletados até agora" : "Itens coletados"} value={detail.run.items_fetched} sub={isRunning && detail.run.cursor_info ? detail.run.cursor_info : undefined} />
          <KpiCard icon={ArrowDownUp} label="Itens normalizados" value={detail.run.items_normalized} sub={`${normalizedPct}% do total coletado`} />
          <KpiCard icon={Hash} label="Registros persistidos" value={detail.summary.records_stored} sub={`${normalizedPct}% normalizado com sucesso`} />
          <KpiCard icon={Copy} label="Duplicidades" value={detail.summary.duplicate_raw_ids} sub={dupPct > 0 ? `${dupPct}% do total` : "Nenhuma duplicidade"} />
        </div>
      </section>

      <section>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>Linha do tempo</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div className="mb-4 flex items-center gap-2"><Clock className="h-4 w-4" style={{ color: "var(--color-brand-text)" }} /><p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>Execução</p></div>
            <div className="space-y-2.5">
              {[
                { label: "Início", value: fmtDate(detail.run.started_at) },
                { label: "Fim", value: fmtDate(detail.run.finished_at) },
                { label: "Duração", value: isRunning && liveElapsedStr ? liveElapsedStr : duration },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--color-text-3)" }}>{row.label}</span>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4" style={{ color: "var(--color-brand-text)" }} /><p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>Registros</p></div>
            <div className="space-y-2.5">
              {[
                { label: "Registro mais antigo", value: fmtDate(detail.summary.first_record_at) },
                { label: "Registro mais recente", value: fmtDate(detail.summary.last_record_at) },
                ...(detail.run.cursor_info ? [{ label: "Posição atual", value: detail.run.cursor_info }] : []),
                ...(detail.run.cursor_end ? [{ label: "Cursor técnico", value: detail.run.cursor_end }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--color-text-3)" }}>{row.label}</span>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {hasDisplayErrors && (
        <section
          className="rounded-xl border p-5"
          style={{
            borderColor: isPartial || isRetryable ? "var(--color-medium-border)" : "var(--color-critical-border)",
            background: isPartial || isRetryable ? "var(--color-medium-bg)" : "var(--color-critical-bg)",
          }}
        >
          <div className="mb-1 flex items-center gap-2">
            {isPartial || isRetryable ? <AlertTriangle className="h-4 w-4" style={{ color: "var(--color-status-warning)" }} /> : <CircleX className="h-4 w-4" style={{ color: "var(--color-status-error)" }} />}
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: isPartial || isRetryable ? "var(--color-status-warning)" : "var(--color-status-error)" }}>
              {isPartial ? "Interrupção parcial" : isRetryable ? "Falha na API externa" : "Erros registrados"}
            </p>
          </div>
          {(isPartial || isRetryable) && (
            <p className="mb-3 text-xs" style={{ color: "var(--color-text-2)" }}>
              {isPartial
                ? "A execução foi interrompida por timeout da API externa, mas todos os itens buscados foram normalizados com sucesso. O próximo ciclo retomará automaticamente a partir do cursor salvo."
                : "A API governamental retornou um erro temporário (timeout ou indisponibilidade). Não há falha no sistema OpenWatch — a execução será retomada automaticamente no próximo ciclo."}
            </p>
          )}
          <pre className="max-h-40 overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)", color: "var(--color-text-2)" }}>
            {stringifyJson(displayErrors)}
          </pre>
        </section>
      )}

      <RunFieldProfileTable
        fields={detail.field_profile}
        sampledRecords={detail.summary.profile_sampled_records}
        sampleLimit={detail.summary.profile_sample_limit}
        supportsIncremental={detail.job.supports_incremental}
      />

      <RunSamplesViewer samples={detail.samples} />

      <div className="rounded-xl border px-5 py-4" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)" }}>
        <p className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--color-text-3)" }}>
          <strong style={{ color: "var(--color-text-2)" }}>Transparência:</strong>{" "}
          Esta página exibe o detalhe técnico de uma execução de ingestão de dados públicos. Os registros são obtidos
          exclusivamente de fontes oficiais e tratados com deduplicação automática. Nenhum dado pessoal é coletado além
          do estritamente necessário (LGPD art. 7, VII).
        </p>
      </div>
    </div>
  );
}
