"use client";

// Trilho de identidade da página de Órgão (Nexo). Mesma linguagem do
// perfil de entidade, com métricas próprias de órgão (sinais, contratos,
// score de risco).

import { Landmark } from "lucide-react";
import { formatBRL } from "@/lib/utils";
import type { OrgSummary } from "@/lib/types";

export function OrgIdentityRail({ org }: { org: OrgSummary }) {
  const color = "var(--color-entity-org)";
  const identifierEntries = Object.entries(org.identifiers).filter(
    ([, v]) => v != null && v !== "",
  );
  const uf =
    (org.attrs?.uf as string | undefined) ??
    org.identifiers?.uf ??
    (org.attrs?.state as string | undefined);
  const highRisk =
    (org.severity_distribution?.critical ?? 0) + (org.severity_distribution?.high ?? 0);

  const stats: Array<{ value: string; label: string; tone?: string }> = [
    { value: String(org.total_signals), label: "sinais" },
    {
      value: org.total_contracts_value > 0 ? formatBRL(org.total_contracts_value) : "—",
      label: "contratos",
    },
    {
      value: org.risk_score != null ? org.risk_score.toFixed(0) : "—",
      label: "score de risco",
      tone:
        org.risk_score != null && org.risk_score > 70
          ? "var(--color-critical)"
          : org.risk_score != null && org.risk_score > 40
            ? "var(--color-high)"
            : undefined,
    },
    {
      value: String(highRisk),
      label: "crítico + alto",
      tone: highRisk > 0 ? "var(--color-high)" : undefined,
    },
  ];

  return (
    <aside className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `2px solid ${color}`,
            color,
          }}
        >
          <Landmark className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-display-md leading-tight" style={{ color: "var(--color-text)" }}>
            {org.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="ow-badge ow-badge-neutral">{org.type ?? "Órgão"}</span>
            {uf && <span className="ow-badge ow-badge-info">{uf}</span>}
          </div>
        </div>
      </div>

      {identifierEntries.length > 0 && (
        <div className="flex flex-col">
          <p className="mb-2 text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
            Dados cadastrais
          </p>
          {identifierEntries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-3 border-b py-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
                {key}
              </span>
              <span className="ow-id text-right">{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <div
              className="text-display-sm leading-none tabular-nums"
              style={{ color: s.tone ?? "var(--color-text)" }}
            >
              {s.value}
            </div>
            <div className="mt-1.5 text-mono-xs" style={{ color: "var(--color-text-3)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
