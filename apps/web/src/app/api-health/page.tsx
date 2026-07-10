"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { getApiHeartbeat, getCoverageV2Summary } from "@/lib/api";
import type { CoverageV2SummaryResponse } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  DatabaseZap,
  RefreshCw,
  ServerCrash,
  Workflow,
  ShieldCheck,
  Circle,
} from "lucide-react";

type HealthTone = "healthy" | "attention" | "blocked";
type CheckStatus = "ok" | "attention" | "error";

interface ServiceCheck {
  id: string;
  name: string;
  endpoint: string;
  status: CheckStatus;
  detail: string;
  icon: typeof Activity;
}

function overallFromChecks(checks: ServiceCheck[]): HealthTone {
  if (checks.some((c) => c.status === "error")) return "blocked";
  if (checks.some((c) => c.status === "attention")) return "attention";
  return "healthy";
}

// Status colors use the dedicated --color-status-* tokens (not severity
// tones) — this page reports service health, not finding severity.
const TONE_CONFIG: Record<HealthTone, {
  label: string;
  color: string;
  dotClass: string;
  Icon: typeof CheckCircle2;
}> = {
  healthy:   { label: "Operacional", color: "var(--color-status-ok)",      dotClass: "ow-status-ok",      Icon: CheckCircle2 },
  attention: { label: "Atenção",     color: "var(--color-status-warning)", dotClass: "ow-status-warning", Icon: AlertTriangle },
  blocked:   { label: "Bloqueado",   color: "var(--color-status-error)",   dotClass: "ow-status-error",   Icon: ServerCrash   },
};

const STATUS_CONFIG: Record<CheckStatus, {
  label: string;
  color: string;
  dotClass: string;
}> = {
  ok:        { label: "ok",      color: "var(--color-status-ok)",      dotClass: "ow-status-ok"      },
  attention: { label: "atenção", color: "var(--color-status-warning)", dotClass: "ow-status-warning" },
  error:     { label: "erro",    color: "var(--color-status-error)",   dotClass: "ow-status-error"   },
};

export default function ApiHealthPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const [heartbeatOk, setHeartbeatOk] = useState(false);
  const [coverageSummary, setCoverageSummary] = useState<CoverageV2SummaryResponse | null>(null);
  const [heartbeatError, setHeartbeatError] = useState<string | null>(null);
  const [coverageError, setCoverageError] = useState<string | null>(null);

  async function loadHealth() {
    setRefreshing(true);
    setHeartbeatError(null);
    setCoverageError(null);
    try {
      const [heartbeatResult, coverageResult] = await Promise.allSettled([
        getApiHeartbeat(),
        getCoverageV2Summary(),
      ]);

      if (heartbeatResult.status === "fulfilled") {
        setHeartbeatOk(heartbeatResult.value.status === "ok");
      } else {
        setHeartbeatOk(false);
        setHeartbeatError("Sem resposta do container da API.");
      }

      if (coverageResult.status === "fulfilled") {
        setCoverageSummary(coverageResult.value);
      } else {
        setCoverageSummary(null);
        setCoverageError("Nao foi possivel consultar o estado operacional do pipeline.");
      }
    } catch {
      setHeartbeatOk(false);
      setCoverageSummary(null);
      setHeartbeatError("Falha inesperada ao consultar saude da API.");
      setCoverageError("Falha inesperada ao consultar saude do pipeline.");
    } finally {
      setCheckedAt(new Date().toISOString());
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void loadHealth(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => { void loadHealth(); }, 30_000);
    return () => clearInterval(id);
  }, []);

  const checks = useMemo<ServiceCheck[]>(() => [
    {
      id: "api",
      name: "Container API",
      endpoint: "/health",
      icon: Activity,
      status: heartbeatOk ? "ok" : "error",
      detail: heartbeatOk
        ? "API respondendo normalmente."
        : heartbeatError ?? "API sem resposta no heartbeat.",
    },
    {
      id: "pipeline",
      name: "Pipeline de dados",
      endpoint: "/public/coverage/v2/summary",
      icon: Workflow,
      status:
        coverageSummary == null
          ? "error"
          : coverageSummary.pipeline.overall_status === "healthy"
            ? "ok"
            : coverageSummary.pipeline.overall_status === "attention"
              ? "attention"
              : "error",
      detail:
        coverageSummary == null
          ? coverageError ?? "Sem dados operacionais do pipeline."
          : `Estado atual: ${coverageSummary.pipeline.overall_status}.`,
    },
    {
      id: "workers",
      name: "Workers de processamento",
      endpoint: "/public/coverage/v2/summary",
      icon: Cpu,
      status:
        coverageSummary == null
          ? "error"
          : coverageSummary.totals.runtime.failed_or_stuck > 0
            ? "error"
            : "ok",
      detail:
        coverageSummary == null
          ? "Nao foi possivel validar workers."
          : coverageSummary.totals.runtime.failed_or_stuck > 0
            ? `${coverageSummary.totals.runtime.failed_or_stuck} execucao(oes) com falha/travamento.`
            : coverageSummary.totals.runtime.running > 0
              ? `${coverageSummary.totals.runtime.running} worker(s) em execucao normal.`
              : "Sem execucoes ativas no momento (estado normal).",
    },
  ], [heartbeatOk, heartbeatError, coverageSummary, coverageError]);

  const tone = overallFromChecks(checks);
  const toneConfig = TONE_CONFIG[tone];
  const ToneIcon = toneConfig.Icon;

  const lastCheckedTime = checkedAt
    ? new Date(checkedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="ow-mode-editorial ow-content">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        eyebrow="SISTEMA"
        title="Status da API"
        description="Monitor de disponibilidade técnica dos serviços essenciais"
        variant="hero"
        icon={<ShieldCheck className="h-5 w-5" />}
        stats={[
          { label: "Checks ativos", value: checks.length, mono: true, tone: "brand" },
          { label: "Auto-refresh", value: "30s", mono: true },
          {
            label: "Última leitura",
            value: lastCheckedTime ?? "Aguardando…",
            sub: checkedAt ? new Date(checkedAt).toLocaleDateString("pt-BR") : undefined,
            mono: true,
          },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadHealth()}
            disabled={refreshing}
            loading={refreshing}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
        }
      />

      <div className="space-y-6 animate-fade-in">

        {/* ── Overall state — the one thing that must read instantly ── */}
        {loading ? (
          <div className="ow-card p-6 md:p-7">
            <div className="flex items-center gap-4">
              <div className="ow-skeleton h-16 w-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="ow-skeleton h-2.5 w-48 rounded" />
                <div className="ow-skeleton h-8 w-40 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="ow-card p-6 md:p-7 animate-slide-up"
            style={{ borderColor: `color-mix(in srgb, ${toneConfig.color} 35%, var(--color-border))` }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border"
                  style={{
                    background: `color-mix(in srgb, ${toneConfig.color} 12%, transparent)`,
                    borderColor: `color-mix(in srgb, ${toneConfig.color} 35%, transparent)`,
                  }}
                >
                  <ToneIcon className="h-8 w-8" style={{ color: toneConfig.color }} />
                </div>
                <div>
                  <p className="text-mono-xs uppercase tracking-widest mb-1" style={{ color: "var(--color-text-3)" }}>
                    Estado geral da plataforma
                  </p>
                  <p className="text-display-xl leading-none" style={{ color: toneConfig.color }}>
                    {toneConfig.label}
                  </p>
                  <p className="text-caption mt-2 max-w-md" style={{ color: "var(--color-text-2)" }}>
                    {tone === "healthy"
                      ? "Todos os serviços estão operacionais e respondendo normalmente."
                      : tone === "attention"
                      ? "Um ou mais serviços requerem atenção — veja o detalhe abaixo."
                      : "Serviço crítico indisponível — ação imediata necessária."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 md:items-end shrink-0">
                <div className="flex items-center gap-1.5 text-caption" style={{ color: "var(--color-text-3)" }}>
                  <span className="h-1.5 w-1.5 rounded-full ow-pulse" style={{ background: "var(--color-brand)" }} />
                  Atualiza a cada 30s
                </div>
                <p className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                  Verificado às <span style={{ color: "var(--color-text-2)" }}>{lastCheckedTime ?? "—"}</span>
                </p>
              </div>
            </div>

            {/* At-a-glance signal row */}
            <div
              className="mt-5 pt-5 flex flex-wrap items-center gap-x-6 gap-y-2"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              {checks.map((check) => (
                <div key={check.id} className="flex items-center gap-2">
                  <span className={`ow-status-dot ${STATUS_CONFIG[check.status].dotClass}`} />
                  <span className="text-label" style={{ color: "var(--color-text-2)" }}>
                    {check.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Service checks ──────────────────────────────────── */}
        <section className="animate-slide-up" style={{ animationDelay: "50ms" }}>
          <p className="text-mono-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-text-3)" }}>
            Status dos Serviços
          </p>
          <div className="ow-card overflow-hidden">
            {loading ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
                    style={{ borderColor: "var(--color-border)" }}>
                    <div className="ow-skeleton h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="ow-skeleton h-3 w-40 rounded" />
                      <div className="ow-skeleton h-2.5 w-64 rounded" />
                    </div>
                    <div className="ow-skeleton h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {checks.map((check, i) => {
                  const st = STATUS_CONFIG[check.status];
                  const CheckIcon = check.icon;
                  return (
                    <div
                      key={check.id}
                      className="flex items-center gap-4 px-5 py-4"
                      style={{
                        borderBottom: i < checks.length - 1 ? `1px solid var(--color-border)` : undefined,
                      }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                        style={{ background: "var(--color-surface-3)", borderColor: "var(--color-border)" }}
                      >
                        <CheckIcon className="h-4 w-4" style={{ color: "var(--color-text-3)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-label font-semibold" style={{ color: "var(--color-text)" }}>
                            {check.name}
                          </span>
                          <span className="ow-code text-mono-xs">{check.endpoint}</span>
                        </div>
                        <p className="text-caption mt-0.5" style={{ color: "var(--color-text-2)" }}>
                          {check.detail}
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className={`ow-status-dot ${st.dotClass}`} />
                        <span className="text-label" style={{ color: st.color }}>
                          {st.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Operational metrics ────────────────────────────── */}
        {!loading && coverageSummary && (
          <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="text-mono-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-text-3)" }}>
              Métricas Operacionais
            </p>
            <div className="ow-strip">
              <div className="ow-strip-item">
                <span className="ow-strip-value text-mono" style={{ color: heartbeatOk ? "var(--color-status-ok)" : "var(--color-status-error)" }}>
                  {heartbeatOk ? "OK" : "—"}
                </span>
                <span className="ow-strip-label">API Container</span>
              </div>
              <div className="ow-strip-item">
                <span className="ow-strip-value text-mono" style={{
                  color: coverageSummary.pipeline.overall_status === "healthy"
                    ? "var(--color-status-ok)"
                    : coverageSummary.pipeline.overall_status === "attention"
                    ? "var(--color-status-warning)"
                    : "var(--color-status-error)",
                }}>
                  {coverageSummary.pipeline.overall_status}
                </span>
                <span className="ow-strip-label">Pipeline</span>
              </div>
              <div className="ow-strip-item">
                <span className="ow-strip-value text-mono" style={{
                  color: coverageSummary.totals.runtime.failed_or_stuck > 0
                    ? "var(--color-status-error)"
                    : "var(--color-text)",
                }}>
                  {coverageSummary.totals.runtime.failed_or_stuck}
                </span>
                <span className="ow-strip-label">Falhas/Travamentos</span>
              </div>
              <div className="ow-strip-item">
                <span className="ow-strip-value text-mono">{coverageSummary.totals.runtime.running}</span>
                <span className="ow-strip-label">Workers Ativos</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Recommendations when degraded ─────────────────── */}
        {!loading && tone !== "healthy" && (
          <div className="ow-alert ow-alert-warning animate-slide-up">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-label font-semibold">Ações recomendadas</p>
              <ul className="space-y-1.5">
                {[
                  "Verifique se os containers `api`, `worker` e `beat` estão ativos.",
                  "Valide a conexão com Redis/Postgres e logs de inicialização.",
                  "Reexecute a verificação após estabilizar os serviços.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-caption">
                    <Circle className="mt-1 h-1.5 w-1.5 shrink-0 fill-current" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Monitoring legend ─────────────────────────────── */}
        <section className="ow-card p-5 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <DatabaseZap className="h-4 w-4" style={{ color: "var(--color-text-3)" }} />
            <p className="text-mono-xs uppercase tracking-widest font-semibold" style={{ color: "var(--color-text-3)" }}>
              O que é monitorado
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                Icon: Activity,
                name: "API Container",
                detail: "Heartbeat HTTP via /health. Confirma que o servidor FastAPI está respondendo.",
              },
              {
                Icon: Workflow,
                name: "Pipeline de Dados",
                detail: "Estado geral do pipeline de ingestão — fontes ativas, jobs habilitados e execuções recentes.",
              },
              {
                Icon: Cpu,
                name: "Workers",
                detail: "Celery workers responsáveis pelo processamento assíncrono. Travamentos indicam necessidade de restart.",
              },
            ].map(({ Icon, name, detail }) => (
              <div key={name} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                  style={{ background: "var(--color-surface-3)", borderColor: "var(--color-border)" }}>
                  <Icon className="h-4 w-4" style={{ color: "var(--color-text-3)" }} />
                </div>
                <div>
                  <p className="text-label font-semibold mb-0.5" style={{ color: "var(--color-text)" }}>{name}</p>
                  <p className="text-caption" style={{ color: "var(--color-text-3)" }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
