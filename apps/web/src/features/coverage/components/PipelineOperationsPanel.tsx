import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import type { CoverageV2SourceItem, CoverageV2SummaryResponse } from "@/lib/types";
import { formatElapsed } from "@/features/coverage/lib/coverageStatus";

const STAGE_STATUS: Record<string, { label: string; icon: React.ReactNode; ringColor: string; bgColor: string; textColor: string }> = {
  up_to_date: { label: "Atualizado",    icon: <CheckCircle2 className="h-5 w-5" />, ringColor: "var(--color-low-border)",      bgColor: "var(--color-low-bg)",      textColor: "var(--color-low-text)"      },
  stale:      { label: "Desatualizado", icon: <Clock className="h-5 w-5" />,        ringColor: "var(--color-high-border)",     bgColor: "var(--color-high-bg)",     textColor: "var(--color-high-text)"     },
  processing: { label: "Processando",   icon: <Activity className="h-5 w-5" />,     ringColor: "var(--color-amber-border)",    bgColor: "var(--color-amber-dim)",   textColor: "var(--color-amber-text)"    },
  warning:    { label: "Atenção",       icon: <AlertTriangle className="h-5 w-5" />, ringColor: "var(--color-medium-border)",  bgColor: "var(--color-medium-bg)",   textColor: "var(--color-medium-text)"   },
  error:      { label: "Erro",          icon: <XCircle className="h-5 w-5" />,       ringColor: "var(--color-critical-border)",bgColor: "var(--color-critical-bg)", textColor: "var(--color-critical-text)" },
  pending:    { label: "Pendente",      icon: <Clock className="h-5 w-5" />,         ringColor: "var(--color-border)",         bgColor: "var(--color-surface-3)",   textColor: "var(--color-text-3)"        },
};

interface PipelineOperationsPanelProps {
  summary: CoverageV2SummaryResponse | null;
  sourcesItems: CoverageV2SourceItem[];
  onOpenPipelineModal: () => void;
}

/**
 * Secondary operator surface: pipeline stage flow (ingest → ER → sinais),
 * what's running right now, and the manual dispatch trigger. Sits below the
 * freshness map — the map is the page's headline, this is the "how do I
 * make it move" panel underneath.
 */
export function PipelineOperationsPanel({ summary, sourcesItems, onOpenPipelineModal }: PipelineOperationsPanelProps) {
  if (!summary) return null;
  const stages = summary.pipeline.stages;
  const overallStatus = summary.pipeline.overall_status;
  const overallBadge =
    overallStatus === "healthy" ? "ow-badge ow-badge-low" :
    overallStatus === "attention" ? "ow-badge ow-badge-amber" :
    "ow-badge ow-badge-critical";
  const overallLabel = overallStatus === "healthy" ? "Saudável" : overallStatus === "attention" ? "Atenção" : "Bloqueado";

  const activeJobs = sourcesItems
    .filter((s) => s.runtime.running_jobs > 0)
    .flatMap((s) => s.runtime.active_job_names.map((job) => ({
      connector: s.connector_label,
      connectorKey: s.connector,
      job,
      itemsLive: s.runtime.items_fetched_live,
      rate: s.runtime.estimated_rate_per_min,
      elapsed: s.runtime.elapsed_seconds,
    })));
  const errorJobs = sourcesItems.filter((s) => s.runtime.error_jobs > 0);

  return (
    <section className="ow-card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--color-surface-3)" }}>
            <Zap className="h-4 w-4" style={{ color: "var(--color-text-3)" }} />
          </div>
          <p className="text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
            Pipeline de ingestão
          </p>
          <span className={overallBadge}>{overallLabel}</span>
        </div>
        <Button variant="amber" size="sm" onClick={onOpenPipelineModal}>
          <Zap className="h-3.5 w-3.5" />
          Executar Pipeline
        </Button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((stage) => {
          const scfg = STAGE_STATUS[stage.status] ?? STAGE_STATUS.pending;
          return (
            <div key={stage.code} className="rounded-xl border-2 p-4 flex flex-col items-center gap-2.5 text-center" style={{ borderColor: scfg.ringColor, background: scfg.bgColor }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--color-surface)", color: scfg.textColor }}>
                {scfg.icon}
              </div>
              <div>
                <p className="text-label font-bold leading-snug" style={{ color: "var(--color-text)" }}>{stage.label}</p>
                <p className="text-mono-xs font-bold uppercase mt-0.5" style={{ color: scfg.textColor }}>{scfg.label}</p>
                {stage.reason && stage.status !== "up_to_date" && (
                  <p className="text-caption mt-1 leading-snug" style={{ color: "var(--color-text-2)" }}>{stage.reason}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(activeJobs.length > 0 || errorJobs.length > 0) && (
        <div className="space-y-2 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-mono-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-text-3)" }}>
            Acontecendo agora
          </p>
          {activeJobs.map((aj) => (
            <div key={`${aj.connectorKey}-${aj.job}`} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5" style={{ borderColor: "var(--color-amber-border)", background: "var(--color-amber-dim)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-2 w-2 rounded-full animate-pulse shrink-0" style={{ background: "var(--color-amber)" }} />
                <p className="text-mono-xs font-bold truncate" style={{ color: "var(--color-text)" }}>
                  {aj.connector} <span style={{ color: "var(--color-text-3)", fontWeight: "normal" }}>/ {aj.job}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                {aj.itemsLive > 0 && <span className="font-bold" style={{ color: "var(--color-text)" }}>{aj.itemsLive.toLocaleString("pt-BR")} itens</span>}
                {aj.rate != null && aj.rate > 0 && <span style={{ color: "var(--color-amber-text)" }}>~{Math.round(aj.rate).toLocaleString("pt-BR")}/min</span>}
                {aj.elapsed != null && <span>{formatElapsed(aj.elapsed)}</span>}
              </div>
            </div>
          ))}
          {errorJobs.length > 0 && (
            <div className="ow-alert ow-alert-error">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-mono-xs font-bold mb-1.5">
                  {errorJobs.reduce((n, s) => n + s.runtime.error_jobs, 0)} job(s) com erro
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {errorJobs.map((s) => (
                    <span key={s.connector} className="ow-badge ow-badge-critical text-mono-xs">
                      {s.connector_label} ({s.runtime.error_jobs})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
