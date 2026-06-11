"use client";

// Painel lateral por nó (doc §3.4, passo 5): dados cadastrais, sinais
// associados e evidências/fontes do nó clicado no grafo.

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Drawer } from "@/components/Drawer";
import { getEntity, getRadarV2Signals } from "@/lib/api";
import type { GraphNode } from "@/lib/types";
import { displayIdentifierValue, formatDate, severityNumeric } from "@/lib/utils";
import { IndicioDisclaimer } from "@/components/IndicioDisclaimer";

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

export function NodeDetailDrawer({
  node,
  onClose,
}: {
  node: GraphNode | null;
  onClose: () => void;
}) {
  const entityId = node?.entity_id ?? null;

  const entityQuery = useQuery({
    queryKey: ["entity", entityId],
    queryFn: () => getEntity(entityId as string),
    enabled: Boolean(entityId),
    staleTime: 5 * 60 * 1000,
  });

  const signalsQuery = useQuery({
    queryKey: ["entity-signals", entityId],
    queryFn: () => getRadarV2Signals({ orgao_id: entityId as string, limit: 10 }),
    enabled: Boolean(entityId),
    staleTime: 5 * 60 * 1000,
  });

  const entity = entityQuery.data;

  return (
    <Drawer open={Boolean(node)} onClose={onClose} title={node?.label ?? ""} width="w-[26rem]">
      {node && (
        <div className="space-y-4 text-sm">
          {/* Dados cadastrais */}
          <section>
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Dados cadastrais
            </h4>
            <p className="text-primary">{node.label}</p>
            <p className="font-mono text-[10px] uppercase text-muted">{node.node_type}</p>
            {entity && (
              <div className="mt-2 space-y-1">
                {Object.entries(entity.identifiers ?? {}).map(([k, v]) => {
                  const display = displayIdentifierValue(k, v);
                  if (display === null) return null;
                  return (
                    <div key={k} className="flex justify-between font-mono text-[11px]">
                      <span className="uppercase text-muted">{k}</span>
                      <span className="text-primary">{display}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {entityQuery.isLoading && <p className="text-[11px] text-muted">Carregando…</p>}
          </section>

          {/* Sinais associados */}
          <section>
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Sinais associados
            </h4>
            {signalsQuery.data?.items?.length ? (
              <ul className="space-y-2">
                {[...signalsQuery.data.items]
                  .sort((a, b) => severityNumeric(b.severity) - severityNumeric(a.severity))
                  .map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/signal/${s.id}`}
                        className="block rounded-lg border border-border p-2 hover:border-accent/40"
                      >
                        <span className="font-mono text-[10px] text-muted">
                          {s.typology_code} · {SEVERITY_LABEL[s.severity] ?? s.severity}
                        </span>
                        <p className="line-clamp-2 text-[12px] text-primary">{s.title}</p>
                        {s.period_end && (
                          <span className="text-[10px] text-muted">{formatDate(s.period_end)}</span>
                        )}
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : signalsQuery.isLoading ? (
              <p className="text-[11px] text-muted">Carregando…</p>
            ) : (
              <p className="text-[11px] text-muted">Nenhum sinal associado a esta entidade.</p>
            )}
          </section>

          {/* Vínculo no grafo: fonte + data (proveniência da aresta) */}
          <section>
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Navegação
            </h4>
            <Link
              href={`/entity/${node.entity_id}`}
              className="text-[12px] underline hover:text-primary"
            >
              Abrir página da entidade
            </Link>
          </section>

          <IndicioDisclaimer compact />
        </div>
      )}
    </Drawer>
  );
}
