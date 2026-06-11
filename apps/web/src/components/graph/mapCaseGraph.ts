// Mapper compartilhado: converte GNode/GLink (useCaseGraph e derivados)
// para os tipos GraphNode/GraphEdge consumidos pelo SigmaGraph.

import type { GLink, GNode } from "@/hooks/useCaseGraph";
import type { GraphEdge, GraphNode } from "@/lib/types";

export function mapCaseGraphToSigma(
  nodes: GNode[],
  links: GLink[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const sigmaNodes: GraphNode[] = nodes.map((n) => ({
    id: n.id,
    entity_id: n.entity_id,
    label: n.label,
    node_type: n.node_type,
    attrs: {},
  }));

  const sigmaEdges: GraphEdge[] = links.map((l, i) => ({
    // ids estáveis: usa o id da aresta quando existe, senão sintetiza
    id: l.id || `${l.source}->${l.target}:${l.type}:${i}`,
    from_node_id: l.source,
    to_node_id: l.target,
    type: l.type,
    weight: l.weight,
    edge_strength: l.edge_strength ?? "weak",
    ...(l.verification_method !== undefined
      ? { verification_method: l.verification_method }
      : {}),
    ...(l.verification_confidence !== undefined
      ? { verification_confidence: l.verification_confidence }
      : {}),
    attrs: {},
  }));

  return { nodes: sigmaNodes, edges: sigmaEdges };
}
