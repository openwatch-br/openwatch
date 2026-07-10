"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock, Loader2, Play, X, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import {
  getPipelineStatus,
  triggerFullPipeline,
  type PipelineDispatchResponse,
  type PipelineStatusResponse,
} from "@/lib/operatorApiClient";

type StageKey = "ingest" | "entity_resolution" | "signals";
type StageStatus = "idle" | "dispatching" | "dispatched" | "error";

interface StageState {
  status: StageStatus;
  taskId?: string;
}

const PIPELINE_STAGE_DEFS: { key: StageKey; label: string; description: string; worker: string }[] = [
  { key: "ingest", label: "Ingestão de Dados", description: "Coleta incremental de todas as fontes públicas federais", worker: "worker-ingest" },
  { key: "entity_resolution", label: "Resolução de Entidades", description: "Deduplicação e agrupamento de CPF/CNPJ entre fontes", worker: "worker-er" },
  { key: "signals", label: "Sinais de Risco", description: "Execução das 22 tipologias de corrupção detectadas", worker: "worker-cpu" },
];

const IDLE_STAGES: Record<StageKey, StageState> = {
  ingest: { status: "idle" },
  entity_resolution: { status: "idle" },
  signals: { status: "idle" },
};

/** Confirmation + progress modal for the "Executar Pipeline" operator action. */
export function PipelineExecutionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stages, setStages] = useState<Record<StageKey, StageState>>(IDLE_STAGES);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [alreadyRunning, setAlreadyRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allDispatched = Object.values(stages).every((s) => s.status === "dispatched");

  useEffect(() => {
    if (!open) return;
    setChecking(true);
    setAlreadyRunning(false);
    setError(null);
    setStages(IDLE_STAGES);
    getPipelineStatus()
      .then((status: PipelineStatusResponse) => {
        if (status.is_running) {
          setAlreadyRunning(true);
          setStages({
            ingest: { status: status.stages.ingest === "running" ? "dispatched" : "idle" },
            entity_resolution: { status: status.stages.entity_resolution === "running" ? "dispatched" : "idle" },
            signals: { status: status.stages.signals === "running" ? "dispatched" : "idle" },
          });
        }
      })
      .catch(() => { /* status check is best-effort */ })
      .finally(() => setChecking(false));
  }, [open]);

  function resetAndClose() {
    setStages(IDLE_STAGES);
    setRunning(false);
    setAlreadyRunning(false);
    setError(null);
    onClose();
  }

  async function handleExecute() {
    if (running) return;
    setRunning(true);
    setError(null);
    setStages({ ingest: { status: "dispatching" }, entity_resolution: { status: "dispatching" }, signals: { status: "dispatching" } });
    try {
      const result: PipelineDispatchResponse = await triggerFullPipeline();
      setStages({
        ingest: { status: "dispatched", taskId: result.pipeline_id },
        entity_resolution: { status: "dispatched", taskId: result.pipeline_id },
        signals: { status: "dispatched", taskId: result.pipeline_id },
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes("409")) {
        setAlreadyRunning(true);
        setStages(IDLE_STAGES);
      } else {
        setError(e instanceof Error ? e.message : "Erro ao disparar o pipeline.");
        setStages({ ingest: { status: "error" }, entity_resolution: { status: "error" }, signals: { status: "error" } });
      }
    } finally {
      setRunning(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={!running ? resetAndClose : undefined}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)" }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ background: "var(--color-amber-dim)", borderColor: "var(--color-amber-border)" }}>
              <Zap className="h-4 w-4" style={{ color: "var(--color-amber-text)" }} />
            </div>
            <div>
              <p className="text-label font-semibold" style={{ color: "var(--color-text)" }}>Executar Pipeline</p>
              <p className="text-caption" style={{ color: "var(--color-text-3)" }}>Ingestão → ER → Sinais de Risco</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="rounded-lg p-1.5 transition-colors" style={{ color: "var(--color-text-3)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {alreadyRunning && (
          <div className="mx-6 mt-5">
            <div className="ow-alert ow-alert-warning">
              <Activity className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-label font-semibold">Pipeline já em execução</p>
                <p className="mt-0.5 text-caption">Os workers já estão processando dados. Aguarde a conclusão do ciclo atual.</p>
              </div>
            </div>
          </div>
        )}

        {checking && (
          <div className="flex items-center justify-center gap-2 py-6 text-caption" style={{ color: "var(--color-text-3)" }}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Verificando estado do pipeline...
          </div>
        )}

        {!checking && (
          <div className="px-6 py-5 space-y-3">
            {PIPELINE_STAGE_DEFS.map((def, i) => {
              const stage = stages[def.key];
              const isActive = alreadyRunning && stage.status === "dispatched";
              const isDispatched = !alreadyRunning && stage.status === "dispatched";
              const isDispatching = stage.status === "dispatching";
              const isError = stage.status === "error";

              const stageBorderColor = isActive ? "var(--color-amber-border)" : isDispatched ? "var(--color-low-border)" : isError ? "var(--color-critical-border)" : "var(--color-border)";
              const stageBg = isActive ? "var(--color-amber-dim)" : isDispatched ? "var(--color-low-bg)" : isError ? "var(--color-critical-bg)" : "var(--color-surface-2)";

              return (
                <div key={def.key} className="flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-300" style={{ borderColor: stageBorderColor, background: stageBg }}>
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-mono-xs font-bold transition-all duration-300 border"
                    style={{
                      background: isDispatched ? "var(--color-low)" : isError ? "var(--color-critical)" : "var(--color-surface)",
                      borderColor: isActive ? "var(--color-amber-border)" : "var(--color-border)",
                      color: isDispatched || isError ? "white" : isActive ? "var(--color-amber-text)" : "var(--color-text-3)",
                    }}
                  >
                    {isDispatching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isActive ? <Activity className="h-3.5 w-3.5" /> : isDispatched ? <CheckCircle2 className="h-4 w-4" /> : isError ? <XCircle className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-label font-semibold" style={{ color: isActive ? "var(--color-amber-text)" : isDispatched ? "var(--color-low-text)" : isError ? "var(--color-critical-text)" : "var(--color-text)" }}>
                        {def.label}
                        {isActive && <span className="ml-2 text-mono-xs font-normal" style={{ color: "var(--color-amber-text)", opacity: 0.7 }}>em execução</span>}
                      </p>
                      <span className="text-mono-xs px-1.5 py-0.5 rounded border shrink-0" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-3)" }}>
                        {def.worker}
                      </span>
                    </div>
                    <p className="mt-0.5 text-caption" style={{ color: "var(--color-text-2)" }}>{def.description}</p>
                    {isDispatched && stage.taskId && (
                      <p className="mt-1.5 text-mono-xs truncate" style={{ color: "var(--color-low-text)", opacity: 0.7 }}>task: {stage.taskId}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mx-6 mb-4">
            <div className="ow-alert ow-alert-error">{error}</div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          {alreadyRunning ? (
            <div className="flex w-full items-center justify-between">
              <p className="flex items-center gap-1.5 text-caption" style={{ color: "var(--color-text-2)" }}>
                <Clock className="h-3.5 w-3.5" />
                O pipeline conclui automaticamente
              </p>
              <Button variant="ghost" size="sm" onClick={resetAndClose}>Fechar</Button>
            </div>
          ) : allDispatched ? (
            <div className="flex w-full items-center justify-between">
              <p className="flex items-center gap-1.5 text-caption font-semibold" style={{ color: "var(--color-low-text)" }}>
                <CheckCircle2 className="h-4 w-4" />
                Pipeline iniciado com sucesso
              </p>
              <Button variant="ghost" size="sm" onClick={resetAndClose}>Fechar</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={resetAndClose} disabled={running}>Cancelar</Button>
              <Button variant="amber" size="sm" onClick={handleExecute} disabled={running || checking} loading={running}>
                {!running && <Play className="h-3.5 w-3.5" />}
                {running ? "Iniciando..." : "Executar"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
