"use client";

import Link from "next/link";
import { formatCPF } from "@/lib/utils";
import type { TimelineEntityDTO } from "@/lib/types";

const ENTITY_TOKEN: Record<string, string> = {
  org: "var(--color-entity-org)",
  company: "var(--color-entity-company)",
  person: "var(--color-entity-person)",
};
const ENTITY_LABEL: Record<string, string> = {
  org: "Órgão Público",
  company: "Empresa",
  person: "Pessoa Física",
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? (p[p.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

/** Compact entity card — avatar/initials, name, type, and identifiers. */
export function EntityMiniCard({
  entity,
  href,
}: {
  entity: TimelineEntityDTO;
  href?: string;
}) {
  const col = ENTITY_TOKEN[entity.type] ?? "var(--color-entity-unknown)";
  const photoUrl = typeof entity.attrs.photo_url === "string" ? entity.attrs.photo_url : null;
  const cnpj = entity.identifiers.cnpj;
  const cpf = entity.identifiers.cpf;

  const body = (
    <div className="rounded-xl border border-border bg-surface-card p-4 transition-colors hover:border-brand-border">
      <div className="mb-2 flex items-center gap-3">
        {photoUrl ? (
          <img src={photoUrl} alt={entity.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
        ) : (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[var(--color-text-inv)]"
            style={{ backgroundColor: col }}
          >
            {initials(entity.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-primary">{entity.name}</p>
          <span className="font-mono text-[9px] font-bold uppercase" style={{ color: col }}>
            {ENTITY_LABEL[entity.type] ?? entity.type}
          </span>
        </div>
      </div>
      {cnpj && <p className="font-mono text-[10px] text-muted">CNPJ {cnpj}</p>}
      {cpf && <p className="font-mono text-[10px] text-muted">CPF {formatCPF(cpf)}</p>}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
