"use client";

import { toast } from "sonner";
import { useState } from "react";
import { StatusDot } from "@/components/StatusDot";
import { Button, LinkButton } from "@/components/Button";
import { triggerFullPipeline } from "@/lib/operatorApiClient";
import { relativeTime } from "@/lib/utils";
import type { CoverageV2LatestRun, CoverageV2SourceItem } from "@/lib/types";
import { fmtDate } from "@/features/coverage/lib/coverageStatus";

interface FailedRunDetailProps {
  source: CoverageV2SourceItem;
  run: CoverageV2LatestRun | null;
}

/**
 * Anchors the "ausência de sinal ≠ regularidade" disclaimer to the specific
 * source that's actually failing right now, instead of stating it as
 * generic page boilerplate. There's no per-connector retry endpoint on the
 * backend today (only a full-pipeline dispatch and a per-connector
 * "yield" signal) — "Reexecutar" is honestly wired to the real full-pipeline
 * trigger rather than pretending to retry just this one source.
 */
export function FailedRunDetail({ source, run }: FailedRunDetailProps) {
  const [retrying, setRetrying] = useState(false);
  const isError = source.worst_status === "error";
  const isStale = source.worst_status === "stale" || source.worst_status === "warning";

  const heading = isError ? "Última falha" : isStale ? "Fonte desatualizada" : "Diagnóstico";
  const errorText = run?.error_message
    ?? (isStale ? `Sem ingestão recente — defasagem acima do esperado.` : null);

  async function handleRetry() {
    setRetrying(true);
    try {
      await triggerFullPipeline();
      toast.success("Pipeline disparado — inclui esta fonte na próxima rodada de ingestão.");
    } catch {
      toast.error("Não foi possível disparar o pipeline agora.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="grid grid-cols-1 border-t border-[var(--color-border)] lg:grid-cols-[1.4fr_1fr]">
      <div className="border-b border-[var(--color-border)] p-5 lg:border-b-0 lg:border-r">
        <p className="mb-3.5 text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
          {heading} · {source.connector_label}
        </p>
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: isError ? "var(--color-critical-border)" : "var(--color-border)",
            background: isError ? "var(--color-critical-bg)" : "var(--color-surface-2)",
          }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusDot size="sm" status={source.worst_status} pulse={isError} />
            <span className="text-mono-xs font-semibold" style={{ color: isError ? "var(--color-critical-text)" : "var(--color-text)" }}>
              {run ? `run_${run.id.slice(0, 8)}` : source.connector}
              {run?.status ? ` · ${run.status}` : ""}
            </span>
            {run?.started_at && (
              <span className="ml-auto text-mono-xs" style={{ color: "var(--color-text-3)" }}>
                {relativeTime(run.started_at)}
              </span>
            )}
          </div>

          <pre
            className="mt-3.5 whitespace-pre-wrap text-[11.5px] leading-relaxed"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-2)" }}
          >
            {errorText ?? "Nenhum erro registrado — fonte operando dentro do esperado."}
            {"\n"}último sucesso: {source.last_success_at ? fmtDate(source.last_success_at) : "não registrado"}
          </pre>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="primary" size="sm" onClick={handleRetry} loading={retrying}>
              Reexecutar pipeline
            </Button>
            {run ? (
              <LinkButton variant="outline" size="sm" href={`/coverage/run/${run.id}`}>
                Ver log completo
              </LinkButton>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Ver log completo
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center p-5">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: "var(--color-text-2)" }}>
            <span aria-hidden style={{ color: "var(--color-medium-text)" }}>◮</span>
            <span>
              <strong style={{ color: "var(--color-text)" }}>Ausência de sinal não é atestado de regularidade.</strong>{" "}
              Enquanto <strong style={{ color: "var(--color-text)" }}>{source.connector_label}</strong> está{" "}
              {isError ? "indisponível" : "desatualizada"}, sinais que dependem desta fonte podem ficar{" "}
              <em>incompletos</em> — casos podem existir sem terem sido detectados.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
