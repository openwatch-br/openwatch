"use client";

import type { SignalDetail } from "@/lib/types";

/** Risk factors that fired, plus the analysis-completeness meter. */
export function SignalFactors({ signal }: { signal: SignalDetail }) {
  const factors = signal.factors ? Object.entries(signal.factors) : [];
  const descs = signal.factor_descriptions ?? {};
  const completeness = signal.completeness_score;
  const sufficient = signal.completeness_status === "sufficient";

  if (factors.length === 0 && completeness == null) return null;

  return (
    <section>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Fatores de risco
      </p>

      {factors.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
          {factors.map(([key, value]) => {
            const meta = descs[key];
            return (
              <div key={key} className="rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {meta?.label ?? key}
                </p>
                <p className="mt-1 font-mono text-[15px] font-semibold text-primary">
                  {typeof value === "number" ? value.toLocaleString("pt-BR") : String(value)}
                  {meta?.unit ? ` ${meta.unit}` : ""}
                </p>
                {meta?.description && (
                  <p className="mt-1 text-[11px] leading-[1.4] text-muted">{meta.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {completeness != null && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[22px] font-semibold text-primary tabular-nums">
              {Math.round(completeness * 100)}%
            </span>
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{
                background: sufficient ? "var(--color-low-bg)" : "var(--color-high-bg)",
                color: sufficient ? "var(--color-low)" : "var(--color-high)",
              }}
            >
              {sufficient ? "suficiente" : "insuficiente"}
            </span>
          </div>
          <p className="text-[12px] text-muted">
            {sufficient
              ? "Base factual adequada para o indício."
              : "Podem existir lacunas de informação."}
          </p>
        </div>
      )}
    </section>
  );
}
