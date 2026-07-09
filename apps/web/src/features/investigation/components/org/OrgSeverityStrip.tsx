"use client";

// Distribuição de sinais por severidade do órgão (Nexo) — glifo por banda
// (não depende de cor) + contagem.

import { ShieldCheck } from "lucide-react";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { EmptyState } from "@/components/EmptyState";
import { SEVERITY_LABELS } from "@/lib/constants";
import type { SignalSeverity } from "@/lib/types";

const ORDER: SignalSeverity[] = ["critical", "high", "medium", "low"];

export function OrgSeverityStrip({
  distribution,
  total,
}: {
  distribution: Record<string, number> | undefined;
  total: number;
}) {
  if (!total || !distribution) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Nenhum sinal registrado"
        description="Este órgão não possui sinais de risco identificados."
      />
    );
  }

  return (
    <section>
      <p className="mb-3 text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
        Distribuição por severidade
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ORDER.map((sev) => (
          <div
            key={sev}
            className="flex flex-col gap-2 rounded-lg border px-4 py-3"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <div className="flex items-center gap-2" style={{ color: `var(--color-${sev})` }}>
              <SeverityGlyph severity={sev} />
              <span className="text-mono-xs uppercase tracking-widest">{SEVERITY_LABELS[sev]}</span>
            </div>
            <span
              className="text-display-sm leading-none tabular-nums"
              style={{ color: "var(--color-text)" }}
            >
              {distribution[sev] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
