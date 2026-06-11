"use client";

// Grafo de vizinhança centrado numa entidade (Sigma.js).
// Substitui o antigo EntityNetworkGraph (SVG custom) e o GraphView
// (@xyflow+ELK): expansão progressiva via useEgoExpansion + painel
// lateral NodeDetailDrawer ao clicar num nó.

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { NodeDetailDrawer } from "@/components/graph/NodeDetailDrawer";
import { useEgoExpansion } from "@/components/graph/useEgoExpansion";
import type { GraphNode } from "@/lib/types";
import { cn } from "@/lib/utils";

const SigmaGraph = dynamic(() => import("@/components/graph/SigmaGraph"), { ssr: false });

interface EntityEgoGraphProps {
  entityId: string;
  className?: string;
  height?: number;
}

function EntityEgoGraphInner({ entityId, className, height = 420 }: EntityEgoGraphProps) {
  const ego = useEgoExpansion(entityId);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { loadRoot, expandNode } = ego;
  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  // SigmaGraph captura o handler no mount — ref mantém a versão mais recente
  const clickRef = useRef<(node: GraphNode) => void>(() => {});
  clickRef.current = (node) => {
    setSelectedNode(node);
    expandNode(node);
  };
  const handleNodeClick = useCallback((node: GraphNode) => clickRef.current(node), []);

  if (ego.loading && ego.nodes.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center bg-surface-card", className)}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-secondary">Carregando grafo...</span>
        </div>
      </div>
    );
  }

  if (ego.error && ego.nodes.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center bg-surface-card", className)}
        style={{ height }}
      >
        <p className="text-sm text-severity-critical">{ego.error}</p>
      </div>
    );
  }

  if (ego.nodes.length === 0) {
    return (
      <div className={cn("p-4 bg-surface-card", className)}>
        <div className="rounded-lg border border-border bg-surface-subtle p-4">
          <p className="text-sm font-semibold text-primary">
            Nenhuma conexão materializada para esta entidade
          </p>
          <p className="mt-1 text-xs text-secondary">
            Isso pode ocorrer quando o processo de resolução de entidades/arestas ainda não foi
            executado ou quando os eventos não possuem co-participantes suficientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-surface-card", className)} style={{ height }}>
      <SigmaGraph
        nodes={ego.nodes}
        edges={ego.edges}
        {...(ego.centerNodeId ? { centerNodeId: ego.centerNodeId } : {})}
        onNodeClick={handleNodeClick}
        className="h-full w-full"
      />
      {ego.loading && (
        <div className="absolute right-2 top-2 z-10 rounded-md bg-surface-card/90 px-2 py-1 text-[10px] text-muted shadow-sm">
          Expandindo...
        </div>
      )}
      <NodeDetailDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}

export function EntityEgoGraph(props: EntityEgoGraphProps) {
  // key reinicia o estado acumulado quando a entidade central muda
  return <EntityEgoGraphInner key={props.entityId} {...props} />;
}
