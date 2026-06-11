"use client";

// Expansão progressiva da ego-network: estado acumulado de nós/arestas +
// fetch paginado da vizinhança ao clicar num nó (doc §3.4, passo 4).

import { useCallback, useRef, useState } from "react";

import { getGraphNeighborhood } from "@/lib/api";
import type { GraphEdge, GraphNode, NeighborhoodResponse } from "@/lib/types";

const PAGE_SIZE = 50;

export interface EgoGraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerNodeId: string | null;
  loading: boolean;
  error: string | null;
  /** nós já expandidos (entity_id) → offset corrente / total */
  expansion: Record<string, { loaded: number; total: number }>;
}

function dedupeMerge(state: EgoGraphState, res: NeighborhoodResponse): EgoGraphState {
  const nodeIds = new Set(state.nodes.map((n) => n.id));
  const edgeIds = new Set(state.edges.map((e) => e.id));
  return {
    ...state,
    nodes: [...state.nodes, ...res.nodes.filter((n) => !nodeIds.has(n.id))],
    edges: [...state.edges, ...res.edges.filter((e) => !edgeIds.has(e.id))],
    centerNodeId: state.centerNodeId ?? res.center_node_id,
  };
}

export function useEgoExpansion(rootEntityId: string | null) {
  const [state, setState] = useState<EgoGraphState>({
    nodes: [],
    edges: [],
    centerNodeId: null,
    loading: false,
    error: null,
    expansion: {},
  });
  const loadedRoot = useRef<string | null>(null);

  const fetchNeighborhood = useCallback(
    async (entityId: string, offset: number) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await getGraphNeighborhood(entityId, 1, { offset, limit: PAGE_SIZE });
        setState((s) => {
          const merged = dedupeMerge(s, res);
          const prev = s.expansion[entityId] ?? { loaded: 0, total: 0 };
          return {
            ...merged,
            loading: false,
            expansion: {
              ...s.expansion,
              [entityId]: {
                loaded: Math.max(prev.loaded, offset + res.nodes.length - 1),
                total: res.total ?? prev.total,
              },
            },
          };
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Erro ao expandir vizinhança",
        }));
      }
    },
    [],
  );

  /** Carga inicial da raiz (idempotente) */
  const loadRoot = useCallback(() => {
    if (!rootEntityId || loadedRoot.current === rootEntityId) return;
    loadedRoot.current = rootEntityId;
    void fetchNeighborhood(rootEntityId, 0);
  }, [rootEntityId, fetchNeighborhood]);

  /** Clique em nó: expande a vizinhança daquele nó (página seguinte se já expandido) */
  const expandNode = useCallback(
    (node: GraphNode) => {
      const entityId = node.entity_id;
      const prev = state.expansion[entityId];
      const offset = prev ? prev.loaded : 0;
      if (prev && prev.total > 0 && prev.loaded >= prev.total) return; // esgotado
      void fetchNeighborhood(entityId, offset);
    },
    [state.expansion, fetchNeighborhood],
  );

  const hasMore = useCallback(
    (entityId: string) => {
      const e = state.expansion[entityId];
      return !e || e.total === 0 || e.loaded < e.total;
    },
    [state.expansion],
  );

  return { ...state, loadRoot, expandNode, hasMore };
}
