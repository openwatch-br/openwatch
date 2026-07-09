"use client";

// Rede — o canvas de exploração (Nexo). O grafo ocupa tudo (full-bleed);
// controles são ilhas flutuantes sobre o canvas e o detalhe do nó abre num
// drawer à direita (dentro de EntityEgoGraph). É espaço de trabalho, não
// formulário.

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NODE_LEGEND } from "@/components/graph/graphStyle";

const EntityEgoGraph = dynamic(
  () => import("@/components/EntityEgoGraph").then((m) => ({ default: m.EntityEgoGraph })),
  {
    loading: () => <div className="h-full w-full animate-pulse bg-surface-dark" />,
    ssr: false,
  },
);

export default function EntityNetworkPage() {
  const { entityId } = useParams<{ entityId: string }>();

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100dvh - var(--shell-height, 56px))", background: "var(--color-surface-dark)" }}
    >
      {/* Graph fills the canvas */}
      {entityId && <EntityEgoGraph entityId={entityId} fill />}

      {/* Top-left floating island — back to Rede */}
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <Link
          href="/radar/rede"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium backdrop-blur-md transition-colors"
          style={{
            borderColor: "var(--color-border-strong)",
            background: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
            color: "var(--color-text-2)",
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Rede
        </Link>
      </div>

      {/* Bottom-left floating island — legend */}
      <div
        className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-2.5 text-mono-xs backdrop-blur-md"
        style={{
          borderColor: "var(--color-border-strong)",
          background: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
          color: "var(--color-text-2)",
        }}
      >
        {NODE_LEGEND.filter((n) => n.type !== "unknown").map((n) => (
          <span key={n.type} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-entity-${n.type})` }} />
            {n.label}
          </span>
        ))}
        <span className="h-4 w-px" style={{ background: "var(--color-border-strong)" }} />
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-4"
            style={{ borderTop: "1.5px dashed var(--color-brand)", height: 0 }}
          />
          societário
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-4"
            style={{ borderTop: "1.5px solid var(--color-border-strong)", height: 0 }}
          />
          contrato
        </span>
      </div>
    </div>
  );
}
