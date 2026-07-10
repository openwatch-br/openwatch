"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, AlertTriangle, Lightbulb, ArrowUpRight, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import type { CoverageV2LatestRun, CoverageV2SourceItem, CoverageV2SourcePreviewResponse } from "@/lib/types";
import {
  STATUS_CFG,
  RUN_STATUS_CFG,
  formatLag,
  formatDuration,
  fmtDate,
  lagColor,
} from "@/features/coverage/lib/coverageStatus";

function CoverageStatusBadge({ status }: { status: CoverageV2SourceItem["worst_status"] }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={cfg.badge}>
      <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ background: cfg.dotColor }} />
      {cfg.label}
    </span>
  );
}

function EffectiveBadge({ item }: { item: CoverageV2SourceItem }) {
  if (item.runtime.running_jobs > 0) {
    return (
      <span className="ow-badge ow-badge-amber">
        <span className="inline-block h-1.5 w-1.5 rounded-full mr-1 animate-pulse" style={{ background: "var(--color-amber)" }} />
        Executando
      </span>
    );
  }
  return <CoverageStatusBadge status={item.worst_status} />;
}

/** Compact card for a single recent run — reused by the job drill-down list. */
function RunCard({ run }: { run: CoverageV2LatestRun }) {
  const key = run.is_stuck ? "stuck" : run.status;
  const cfg = RUN_STATUS_CFG[key] ?? RUN_STATUS_CFG.pending;

  return (
    <div className="ow-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.dotColor }} />
          <span className="text-mono-xs font-bold" style={{ color: cfg.textColor }}>
            {run.is_stuck ? "Travado" : (RUN_STATUS_CFG[run.status]?.label ?? run.status)}
          </span>
          <span className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
            {formatDuration(run.started_at, run.finished_at)}
          </span>
        </div>
        <Link
          href={`/coverage/run/${run.id}`}
          className="flex items-center gap-1 text-mono-xs hover:underline"
          style={{ color: "var(--color-amber-text)" }}
        >
          Detalhar
          <ArrowUpRight className="h-2.5 w-2.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-mono-xs uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-3)" }}>Início</p>
          <p className="text-mono-xs" style={{ color: "var(--color-text)" }}>{fmtDate(run.started_at)}</p>
        </div>
        <div>
          <p className="text-mono-xs uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-3)" }}>Fim</p>
          <p className="text-mono-xs" style={{ color: "var(--color-text)" }}>{fmtDate(run.finished_at)}</p>
        </div>
      </div>

      {(run.items_fetched > 0 || run.items_normalized > 0) && (
        <div className="flex items-center gap-4 text-caption">
          <span className="flex items-center gap-1" style={{ color: "var(--color-text-3)" }}>
            <Package className="h-3 w-3 shrink-0" />
            <span className="text-mono-xs font-bold" style={{ color: "var(--color-text)" }}>
              {run.items_fetched.toLocaleString("pt-BR")}
            </span>
            <span>coletados</span>
          </span>
          <span className="flex items-center gap-1" style={{ color: "var(--color-text-3)" }}>
            <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: "var(--color-low-text)" }} />
            <span className="text-mono-xs font-bold" style={{ color: "var(--color-text)" }}>
              {run.items_normalized.toLocaleString("pt-BR")}
            </span>
            <span>normalizados</span>
          </span>
        </div>
      )}

      {run.error_message && (
        <div className="ow-alert ow-alert-error">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <p className="text-mono-xs">{run.error_message}</p>
        </div>
      )}
    </div>
  );
}

interface SourceDetailModalProps {
  item: CoverageV2SourceItem;
  preview: CoverageV2SourcePreviewResponse | undefined;
  loading: boolean;
  onClose: () => void;
}

/**
 * Full drill-down into one source: per-job status, freshness lag, and its
 * most recent run. Reuses the same preview fetch the freshness map already
 * makes (`useSourceRunHistory`) instead of fetching again on open.
 */
export function SourceDetailModal({ item, preview, loading, onClose }: SourceDetailModalProps) {
  const cfg = STATUS_CFG[item.worst_status] ?? STATUS_CFG.pending;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-3xl max-h-[88vh] flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)" }}
      >
        <div
          className="flex items-start justify-between gap-4 border-b px-6 py-4"
          style={{ borderColor: "var(--color-border)", background: cfg.bgColor }}
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-display-sm font-bold" style={{ color: "var(--color-text)" }}>
                {item.connector_label}
              </h2>
              <EffectiveBadge item={item} />
            </div>
            <p className="text-mono-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{item.connector}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
            style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-text-3)" }}
            aria-label="Fechar diagnóstico"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          {[
            { label: "Jobs", value: item.job_count, sub: `${item.enabled_job_count} habilitados`, color: undefined as string | undefined },
            { label: "Em execução", value: item.runtime.running_jobs, sub: null as string | null, color: item.runtime.running_jobs > 0 ? "var(--color-amber-text)" : undefined },
            { label: "Com erro", value: item.runtime.error_jobs, sub: null as string | null, color: item.runtime.error_jobs > 0 ? "var(--color-critical-text)" : undefined },
            {
              label: "Defasagem",
              value: formatLag(item.max_freshness_lag_hours),
              sub: item.last_success_at ? new Date(item.last_success_at).toLocaleString("pt-BR") : null,
              color: lagColor(item.max_freshness_lag_hours),
            },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-mono-xs uppercase tracking-widest mb-1" style={{ color: "var(--color-text-3)" }}>{m.label}</p>
              <p className="text-mono font-bold leading-none" style={{ color: m.color ?? "var(--color-text)" }}>{m.value}</p>
              {m.sub && <p className="text-mono-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{m.sub}</p>}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ background: "var(--color-surface-2)" }}>
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="ow-skeleton h-20 rounded-xl" />
              ))}
            </div>
          )}

          {!loading && !preview && (
            <div className="ow-alert ow-alert-error">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Não foi possível carregar o diagnóstico desta fonte.
            </div>
          )}

          {preview && (
            <>
              {item.runtime.stuck_jobs > 0 && (
                <div className="ow-alert ow-alert-error">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {item.runtime.stuck_jobs} job(s) travado(s) — restart recomendado
                </div>
              )}

              {preview.insights.length > 0 && (
                <section>
                  <p className="text-mono-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-text-3)" }}>
                    Insights ({preview.insights.length})
                  </p>
                  <div className="space-y-2">
                    {preview.insights.map((insight, i) => (
                      <div key={i} className="ow-alert ow-alert-info">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="text-body leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <p className="text-mono-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-text-3)" }}>
                  Jobs ({preview.jobs.length})
                </p>
                <div className="space-y-4">
                  {[...preview.jobs].sort((a, b) => {
                    const aRun = a.latest_run?.status === "running" ? 0 : 1;
                    const bRun = b.latest_run?.status === "running" ? 0 : 1;
                    if (aRun !== bRun) return aRun - bRun;
                    const order = ["error", "warning", "stale", "ok", "pending"];
                    return order.indexOf(a.status) - order.indexOf(b.status);
                  }).map((job) => {
                    const isJobRunning = job.latest_run?.status === "running";
                    const scfg = STATUS_CFG[job.status] ?? STATUS_CFG.pending;
                    return (
                      <div
                        key={job.job}
                        className="rounded-xl border p-4 space-y-4"
                        style={{
                          borderColor: isJobRunning ? "var(--color-amber-border)" : scfg.borderColor,
                          background: isJobRunning ? "var(--color-amber-dim)" : "var(--color-surface)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-mono font-bold" style={{ color: "var(--color-text)" }}>{job.job}</span>
                              {!job.enabled_in_mvp && (
                                <span className="ow-badge ow-badge-neutral text-mono-xs">Desabilitado</span>
                              )}
                            </div>
                            <p className="text-mono-xs" style={{ color: "var(--color-amber-text)" }}>{job.domain}</p>
                            {job.description && (
                              <p className="text-caption mt-1 leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                                {job.description}
                              </p>
                            )}
                          </div>
                          {isJobRunning ? (
                            <span className="ow-badge ow-badge-amber">
                              <span className="inline-block h-1.5 w-1.5 rounded-full mr-1 animate-pulse" style={{ background: "var(--color-amber)" }} />
                              Executando
                            </span>
                          ) : (
                            <CoverageStatusBadge status={job.status} />
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {
                              label: isJobRunning ? "Coletados até agora" : "Itens coletados",
                              value: job.total_items.toLocaleString("pt-BR"),
                              sub: isJobRunning && job.latest_run?.cursor_info ? job.latest_run.cursor_info : null,
                              color: "var(--color-text)",
                            },
                            {
                              label: "Defasagem",
                              value: formatLag(job.freshness_lag_hours),
                              sub: null,
                              color: lagColor(job.freshness_lag_hours),
                            },
                            {
                              label: "Último sucesso",
                              value: job.last_success_at ? fmtDate(job.last_success_at) : "Não registrado",
                              sub: null,
                              color: "var(--color-text)",
                            },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="rounded-lg border px-3 py-2"
                              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                            >
                              <p className="text-mono-xs uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-3)" }}>
                                {m.label}
                              </p>
                              <p className="text-mono-xs font-bold" style={{ color: m.color }}>
                                {m.value}
                              </p>
                              {m.sub && (
                                <p className="text-mono-xs mt-0.5" style={{ color: "var(--color-amber-text)" }}>{m.sub}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {job.latest_run && (
                          <div>
                            <p className="text-mono-xs uppercase tracking-wide mb-2" style={{ color: "var(--color-text-3)" }}>
                              Execução mais recente
                            </p>
                            <RunCard run={job.latest_run} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="text-mono-xs" style={{ color: "var(--color-text-3)" }}>
            Último sucesso:{" "}
            <span style={{ color: "var(--color-text)" }}>
              {item.last_success_at ? new Date(item.last_success_at).toLocaleString("pt-BR") : "—"}
            </span>
          </p>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}
