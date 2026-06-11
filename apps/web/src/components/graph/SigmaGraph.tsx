"use client";

// Grafo de vínculos unificado (Sigma.js + graphology, WebGL).
// Substitui as 3 stacks anteriores (react-force-graph-2d, @xyflow+ELK,
// SVG custom). Expansão progressiva: clique em nó busca a ego-network
// paginada e mescla no grafo (useEgoExpansion).
//
// Importar SEMPRE via next/dynamic com ssr:false — Sigma toca window.

import { useEffect, useMemo, useRef } from "react";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import Sigma from "sigma";

import type { GraphEdge, GraphNode } from "@/lib/types";
import { edgeColor, edgeSize, nodeColor } from "./graphStyle";

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

export function mergeIntoGraph(graph: Graph, nodes: GraphNode[], edges: GraphEdge[], centerNodeId?: string) {
  for (const n of nodes) {
    if (!graph.hasNode(n.id)) {
      graph.addNode(n.id, {
        label: n.label,
        size: n.id === centerNodeId ? 14 : 7,
        color: nodeColor(n.node_type),
        nodeData: n,
      });
    }
  }
  for (const e of edges) {
    if (graph.hasNode(e.from_node_id) && graph.hasNode(e.to_node_id) && !graph.hasEdge(e.id)) {
      graph.addEdgeWithKey(e.id, e.from_node_id, e.to_node_id, {
        label: e.type,
        size: edgeSize(e.edge_strength, e.weight),
        color: edgeColor(e.type),
        edgeData: e,
      });
    }
  }
  circularSeed(graph);
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

    const renderer = new Sigma(graph, container, {
      renderEdgeLabels: false,
      labelColor: { color: "#B9B9C0" },
      labelFont: "Inter, sans-serif",
      labelSize: 11,
      defaultEdgeType: "line",
      zIndex: true,
    });
    sigmaRef.current = renderer;

    renderer.on("clickNode", ({ node }) => {
      const data = graph.getNodeAttribute(node, "nodeData") as GraphNode | undefined;
      if (data && onNodeClick) onNodeClick(data);
    });
    renderer.on("enterNode", () => { container.style.cursor = "pointer"; });
    renderer.on("leaveNode", () => { container.style.cursor = "default"; });

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
      style={{ minHeight: 320 }}
    />
  );
}
