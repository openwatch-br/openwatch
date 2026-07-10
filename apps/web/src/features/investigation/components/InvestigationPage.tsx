"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCaseGraph } from "@/lib/api";
import type { CaseGraphResponse } from "@/lib/types";
import { AlertTriangle, Network, Building2, User, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ENTITY_TYPE_ICONS: Record<string, typeof Building2> = {
  company: Building2,
  person: User,
  org: Building2,
};

// Grafo de investigação removido do produto — esta página agora lista as
// entidades do caso em cards, sem canvas de relacionamentos.
export default function InvestigationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.caseId as string;
  const focusSignalId = searchParams.get("signal_id") ?? undefined;

  const [raw, setRaw] = useState<CaseGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCaseGraph(caseId, 1, { focus_signal_id: focusSignalId })
      .then((data) => {
        if (!cancelled) setRaw(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, focusSignalId]);

  const seedEntityIds = useMemo(() => new Set(raw?.seed_entity_ids ?? []), [raw]);

  const nodeAttrsMap = useMemo(() => {
    if (!raw) return {};
    const map: Record<string, Record<string, unknown>> = {};
    for (const n of raw.nodes) {
      map[n.id] = n.attrs;
    }
    return map;
  }, [raw]);

  if (loading) {
    return (
      <div className="investigation-bg fixed inset-0 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-muted">Carregando entidades da investigacao...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investigation-bg fixed inset-0 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-severity-critical" />
          <p className="text-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!raw || raw.nodes.length === 0) {
    return (
      <div className="investigation-bg fixed inset-0 z-50 flex items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <Network className="h-8 w-8 text-muted" />
          <p className="text-sm text-muted">
            Nenhuma entidade encontrada neste caso
          </p>
          <Link
            href={`/case/${caseId}`}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-[var(--color-text-inv)] transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao caso
          </Link>
        </div>
      </div>
    );
  }

  const focusSignalSummary = raw.focus_signal_summary;

  return (
    <div className="investigation-bg fixed inset-0 z-50 overflow-auto">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/case/${caseId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-secondary shadow-sm transition hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao caso
            </Link>
            <h1 className="font-display text-lg font-semibold text-primary">
              {raw.case_title}
            </h1>
          </div>
          <span className="text-xs text-muted">
            {raw.nodes.length} entidades
          </span>
        </div>

        {focusSignalSummary && (
          <div className="mt-4 rounded-lg border border-accent-subtle bg-accent-subtle/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Sinal em foco
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {focusSignalSummary.title}
            </p>
            <p className="mt-1 text-xs text-secondary">
              {focusSignalSummary.typology_code} - {focusSignalSummary.typology_name}
              {focusSignalSummary.period_start || focusSignalSummary.period_end ? (
                <>
                  {" • "}
                  {focusSignalSummary.period_start ? formatDate(focusSignalSummary.period_start) : "---"}
                  {" -> "}
                  {focusSignalSummary.period_end ? formatDate(focusSignalSummary.period_end) : "---"}
                </>
              ) : null}
            </p>
            {focusSignalSummary.summary && (
              <p className="mt-2 text-xs text-secondary">{focusSignalSummary.summary}</p>
            )}
          </div>
        )}

        <h2 className="font-display mt-6 flex items-center gap-2 text-sm font-semibold text-secondary">
          <Building2 className="h-4 w-4 text-accent" />
          Entidades identificadas ({raw.nodes.length})
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {raw.nodes.map((node) => {
            const EntityIcon = ENTITY_TYPE_ICONS[node.node_type] || Building2;
            const attrs = nodeAttrsMap[node.id] || {};
            const identifiers = (attrs.identifiers || {}) as Record<string, string>;
            const isSeed = seedEntityIds.has(node.entity_id);

            const relatedSignals = raw.signals.filter((s) =>
              s.entity_ids.includes(node.entity_id),
            );

            return (
              <div
                key={node.id}
                className={cn(
                  "rounded-lg border bg-surface-card p-4",
                  isSeed ? "border-accent/30 shadow-sm" : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isSeed ? "bg-accent-subtle" : "bg-surface-subtle",
                  )}>
                    <EntityIcon className={cn(
                      "h-5 w-5",
                      isSeed ? "text-accent" : "text-muted",
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-primary">
                      {node.label}
                    </p>
                    <p className="text-xs capitalize text-muted">
                      {node.node_type}
                      {isSeed && (
                        <span className="ml-1 rounded bg-accent-subtle px-1 py-0.5 text-accent">
                          semente
                        </span>
                      )}
                    </p>
                    {Object.keys(identifiers).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(identifiers).map(([k, v]) => (
                          <span key={k} className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono tabular-nums text-xs text-secondary">
                            {k.toUpperCase()}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {relatedSignals.length > 0 && (
                  <div className="mt-3 border-t border-border pt-2">
                    <p className="text-xs font-medium text-muted">
                      {relatedSignals.length} sinal(is) relacionado(s)
                    </p>
                    <div className="mt-1 space-y-1">
                      {relatedSignals.slice(0, 3).map((s) => (
                        <p key={s.id} className="truncate text-xs text-secondary">
                          {s.typology_code} — {s.title}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <Link
                    href={`/entity/${node.entity_id}`}
                    className="text-xs text-accent hover:underline"
                  >
                    Ver detalhes da entidade
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
