"use client";

// Grafo de vínculos unificado (Sigma.js v3 + graphology, WebGL).
// Expansão progressiva: clique em nó busca a ego-network paginada e
// mescla no grafo (useEgoExpansion).
//
// Estilo/tema/interação centralizados em graphStyle.ts:
//  - paleta por tipo de entidade (canvas escuro nos dois temas)
//  - arestas por tipo semântico; societária = tracejada teal ("fio revelador")
//  - tamanho de nó por grau (contínuo)
//  - hover/seleção esmaecem a vizinhança fora de foco (nodeReducer/edgeReducer)
//
// Importar SEMPRE via next/dynamic com ssr:false — Sigma toca window.

import { useEffect, useMemo, useRef } from "react";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import Sigma from "sigma";

import type { GraphEdge, GraphNode } from "@/lib/types";
import {
  CANVAS_THEME,
  edgeAttributes,
  makeEdgeReducer,
  makeNodeReducer,
  nodeAttributes,
  rendererSettings,
  type InteractionCtx,
} from "./graphStyle";
import { DashedEdgeProgram } from "./dashedEdgeProgram";

export interface SigmaGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerNodeId?: string;
  onNodeClick?: (node: GraphNode) => void;
  /** Segundos de layout FA2 em web worker após cada mutação (default 2s) */
  layoutSeconds?: number;
  className?: string;
}

function circularSeed(graph: Graph) {
  const order = graph.order;
  let i = 0;
  graph.forEachNode((node) => {
    if (graph.getNodeAttribute(node, "x") === undefined) {
      graph.setNodeAttribute(node, "x", Math.cos((2 * Math.PI * i) / Math.max(order, 1)));
      graph.setNodeAttribute(node, "y", Math.sin((2 * Math.PI * i) / Math.max(order, 1)));
    }
    i += 1;
  });
}

/** Recalcula o grau de cada nó (usado pela escala de tamanho). */
function refreshDegrees(graph: Graph) {
  graph.forEachNode((node) => {
    graph.setNodeAttribute(node, "degree", graph.degree(node));
  });
}

export function mergeIntoGraph(
  graph: Graph,
  nodes: GraphNode[],
  edges: GraphEdge[],
  centerNodeId?: string,
) {
  for (const n of nodes) {
    if (!graph.hasNode(n.id)) {
      graph.addNode(n.id, nodeAttributes(n, centerNodeId));
    }
  }
  for (const e of edges) {
    if (graph.hasNode(e.from_node_id) && graph.hasNode(e.to_node_id) && !graph.hasEdge(e.id)) {
      graph.addEdgeWithKey(e.id, e.from_node_id, e.to_node_id, edgeAttributes(e));
    }
  }
  circularSeed(graph);
  refreshDegrees(graph);
}

export default function SigmaGraph({
  nodes,
  edges,
  centerNodeId,
  onNodeClick,
  layoutSeconds = 2,
  className,
}: SigmaGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const layoutRef = useRef<FA2LayoutSupervisor | null>(null);
  const graph = useMemo(() => new Graph({ multi: true }), []);
  // Estado de interação mutável — lido pelos reducers a cada refresh.
  const ctxRef = useRef<InteractionCtx>({});
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  // Sync incoming data into the graphology instance
  useEffect(() => {
    mergeIntoGraph(graph, nodes, edges, centerNodeId);
    const supervisor = layoutRef.current;
    if (supervisor) {
      supervisor.start();
      const t = setTimeout(() => supervisor.stop(), layoutSeconds * 1000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [graph, nodes, edges, centerNodeId, layoutSeconds]);

  // Mount Sigma renderer + FA2 worker
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const settings = forceAtlas2.inferSettings(graph);
    const supervisor = new FA2LayoutSupervisor(graph, { settings });
    layoutRef.current = supervisor;

    const ctx = ctxRef.current;
    const baseEdgeReducer = makeEdgeReducer(CANVAS_THEME, ctx);

    const renderer = new Sigma(graph, container, {
      ...rendererSettings(CANVAS_THEME),
      edgeProgramClasses: { dashed: DashedEdgeProgram },
      nodeReducer: makeNodeReducer(CANVAS_THEME, ctx),
      edgeReducer: (edge, data) => {
        const [s, t] = graph.extremities(edge);
        return baseEdgeReducer(edge, data, s, t);
      },
    });
    sigmaRef.current = renderer;

    // Vizinhança em foco = nó + vizinhos diretos (para esmaecer o resto).
    const focusOn = (node: string | null) => {
      if (!node || !graph.hasNode(node)) {
        ctx.focusNeighborhood = undefined;
        return;
      }
      const set = new Set<string>([node]);
      graph.forEachNeighbor(node, (nb) => set.add(nb));
      ctx.focusNeighborhood = set;
    };

    const syncFocus = () => {
      const focus = selectedRef.current ?? hoveredRef.current;
      ctx.selectedNode = selectedRef.current ?? undefined;
      ctx.hoveredNode = hoveredRef.current ?? undefined;
      focusOn(focus);
      renderer.refresh();
    };

    renderer.on("enterNode", ({ node }) => {
      hoveredRef.current = node;
      container.style.cursor = "pointer";
      syncFocus();
    });
    renderer.on("leaveNode", () => {
      hoveredRef.current = null;
      container.style.cursor = "default";
      syncFocus();
    });
    renderer.on("clickNode", ({ node }) => {
      selectedRef.current = selectedRef.current === node ? null : node;
      syncFocus();
      const data = graph.getNodeAttribute(node, "nodeData") as GraphNode | undefined;
      if (data && onNodeClick) onNodeClick(data);
    });
    renderer.on("clickStage", () => {
      selectedRef.current = null;
      syncFocus();
    });

    supervisor.start();
    const t = setTimeout(() => supervisor.stop(), layoutSeconds * 1000);

    return () => {
      clearTimeout(t);
      supervisor.kill();
      renderer.kill();
      layoutRef.current = null;
      sigmaRef.current = null;
    };
    // onNodeClick intencional fora das deps: handler é estável por página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full"}
      style={{ minHeight: 320, background: "var(--color-surface-dark)" }}
    />
  );
}
