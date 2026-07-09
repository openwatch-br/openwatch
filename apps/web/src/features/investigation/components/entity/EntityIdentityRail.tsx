"use client";

// Trilho de identidade da página de Entidade (Nexo): avatar tipado, nome,
// badge de tipo, confiança de resolução, dados cadastrais e cartões de
// métrica. Extraído de EntityDetailPage para evitar god-file.

import { Building2, Landmark, User } from "lucide-react";
import { entityCssVar, normalizeEntityType } from "@/components/graph/graphStyle";
import { EntityTypeBadge } from "@/components/Badge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { normalizeUnknownDisplay } from "@/lib/utils";
import type { EntityDetail } from "@/lib/types";

const TYPE_ICONS = { person: User, company: Building2, org: Landmark, unknown: Building2 } as const;

interface StatCard {
  value: string;
  label: string;
}

export function EntityIdentityRail({
  entity,
  stats,
}: {
  entity: EntityDetail;
  stats: StatCard[];
}) {
  const type = normalizeEntityType(entity.type);
  const Icon = TYPE_ICONS[type];
  const color = entityCssVar(entity.type);
  const identifierEntries = Object.entries(entity.identifiers).filter(
    ([, v]) => v != null && v !== "" && v !== "unknown",
  );

  return (
    <aside className="flex flex-col gap-6">
      {/* Identity */}
      <div className="flex flex-col gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `2px solid ${color}`,
            color,
          }}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-display-md leading-tight" style={{ color: "var(--color-text)" }}>
            {entity.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <EntityTypeBadge type={type} />
          </div>
        </div>
      </div>

      {/* Resolution confidence */}
      {entity.cluster_confidence != null && (
        <ConfidenceBadge score={entity.cluster_confidence} />
      )}

      {/* Cadastral data */}
      {identifierEntries.length > 0 && (
        <div className="flex flex-col">
          <p
            className="mb-2 text-mono-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-3)" }}
          >
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
              <span className="ow-id text-right">{normalizeUnknownDisplay(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Aliases */}
      {entity.aliases.length > 0 && (
        <div>
          <p className="mb-2 text-mono-xs uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
            Nomes alternativos ({entity.aliases.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entity.aliases.map((alias, i) => (
              <span key={i} className="ow-badge ow-badge-neutral">
                {alias.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="flex gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex-1 rounded-lg border p-3"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <div
              className="text-display-sm leading-none tabular-nums"
              style={{ color: "var(--color-text)" }}
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
