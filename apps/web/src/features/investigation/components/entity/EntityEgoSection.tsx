"use client";

// Seção do ego-graph — peça central do perfil de entidade (Nexo). O grafo
// é o elemento primário; a entidade é o núcleo e suas conexões irradiam.

import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { EntityEgoGraph } from "@/components/EntityEgoGraph";
import { NODE_LEGEND } from "@/components/graph/graphStyle";

export function EntityEgoSection({ entityId, height = 420 }: { entityId: string; height?: number }) {
  return (
    <section
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <header
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span
          className="text-mono-xs uppercase tracking-widest"
          style={{ color: "var(--color-text-3)" }}
        >
          Ego-graph · conexões diretas e de 2º grau
        </span>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            {NODE_LEGEND.filter((n) => n.type !== "unknown").map((n) => (
              <span
                key={n.type}
                className="inline-flex items-center gap-1.5 text-mono-xs"
                style={{ color: "var(--color-text-2)" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: `var(--color-entity-${n.type})` }}
                />
                {n.label.toLowerCase()}
              </span>
            ))}
          </div>
          <Link
            href={`/radar/rede/${entityId}`}
            className="inline-flex items-center gap-1 text-mono-xs transition-colors"
            style={{ color: "var(--color-brand-text)" }}
          >
            tela cheia <Maximize2 className="h-3 w-3" />
          </Link>
        </div>
      </header>
      <EntityEgoGraph entityId={entityId} height={height} />
    </section>
  );
}
