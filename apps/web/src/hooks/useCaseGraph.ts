"use client";

import { useCallback, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCaseGraph, getGraphNeighborhood } from "@/lib/api";
import type {
  CaseGraphResponse,
  CaseSignalBrief,
  GraphNode,
  GraphEdge,
  SignalSeverity,
} from "@/lib/types";

export interface GNode {
  id: string;
  label: string;
  node_type: string;
  entity_id: string;
  isSeed: boolean;
  isFocused: boolean;
  isExpanded?: boolean;
  sourceConnector?: string;
  x?: number;
  y?: number;
}

export interface EdgeContext {
  sharedEventCount: number;
  totalValueBrl: number;
  dateRange: { earliest: string; latest: string } | null;
  topEvents: Array<{
    occurred_at: string;
    description: string;
    value_brl: number | null;
    source_connector: string;
  }>;
}

export interface GLink {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  isFocused: boolean;
  isExpansion?: boolean;
  edge_strength?: string;
  verification_method?: string;
  verification_confidence?: number;
  context?: EdgeContext;
}

export interface CaseGraphData {
  nodes: GNode[];
  links: GLink[];
}

export function useCaseGraph(caseId: string, focusSignalId?: string, depth: number = 1) {
  const [extraNodes, setExtraNodes] = useState<GraphNode[]>([]);
  const [extraEdges, setExtraEdges] = useState<GraphEdge[]>([]);
  const [expanding, setExpanding] = useState(false);

  const { data: raw } = useSuspenseQuery<CaseGraphResponse>({
    queryKey: ["case-graph", caseId, depth, focusSignalId ?? null],
    // "placeholder" é o param sintético do generateStaticParams — buscar
    // durante o prerender derruba o build (422 da API). Grafo vazio.
    queryFn: () =>
      caseId === "placeholder"
        ? Promise.resolve<CaseGraphResponse>({
            case_id: caseId,
            case_title: "",
            case_severity: "low",
            case_status: "open",
            seed_entity_ids: [],
            nodes: [],
            edges: [],
            signals: [],
            truncated: false,
          })
        : getCaseGraph(caseId, depth, { focus_signal_id: focusSignalId }),
  });

  const allNodes = useMemo(() => {
    const merged = [...raw.nodes];
    const ids = new Set(merged.map((n) => n.id));
    for (const n of extraNodes) {
      if (!ids.has(n.id)) {
        ids.add(n.id);
        merged.push(n);
      }
    }
    return merged;
  }, [raw, extraNodes]);

  const allEdges = useMemo(() => {
    const merged = [...raw.edges];
    const ids = new Set(merged.map((e) => e.id));
    for (const e of extraEdges) {
      if (!ids.has(e.id)) {
        ids.add(e.id);
        merged.push(e);
      }
    }
    return merged;
  }, [raw, extraEdges]);

  const seedEntityIds = useMemo(() => new Set(raw.seed_entity_ids ?? []), [raw]);
  const focusEntityIds = useMemo(() => new Set(raw.focus_entity_ids ?? []), [raw]);
  const focusEdgeIds = useMemo(() => new Set(raw.focus_edge_ids ?? []), [raw]);

  const graphData: CaseGraphData = useMemo(() => {
    const nodes: GNode[] = allNodes.map((n) => ({
      id: n.id,
      label: n.label,
      node_type: n.node_type,
      entity_id: n.entity_id,
      isSeed: seedEntityIds.has(n.entity_id),
      isFocused: focusEntityIds.has(n.entity_id),
    }));

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links: GLink[] = allEdges
      .filter((e) => nodeIds.has(e.from_node_id) && nodeIds.has(e.to_node_id))
      .map((e) => ({
        id: e.id,
        source: e.from_node_id,
        target: e.to_node_id,
        type: e.type,
        weight: e.weight,
        isFocused: focusEdgeIds.has(e.id),
        edge_strength: e.edge_strength,
        verification_method: e.verification_method,
        verification_confidence: e.verification_confidence,
      }));

    return { nodes, links };
  }, [allNodes, allEdges, seedEntityIds, focusEntityIds, focusEdgeIds]);

  const degreeMap: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    for (const link of graphData.links) {
      const src = typeof link.source === "string" ? link.source : (link.source as unknown as GNode).id;
      const tgt = typeof link.target === "string" ? link.target : (link.target as unknown as GNode).id;
      map[src] = (map[src] ?? 0) + 1;
      map[tgt] = (map[tgt] ?? 0) + 1;
    }
    return map;
  }, [graphData.links]);

  const entitySeverityMap: Record<string, SignalSeverity> = useMemo(() => {
    const order: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
    const map: Record<string, SignalSeverity> = {};
    for (const sig of raw.signals) {
      for (const eid of sig.entity_ids) {
        const current = map[eid];
        if (!current || (order[sig.severity] ?? 0) > (order[current] ?? 0)) {
          map[eid] = sig.severity;
        }
      }
    }
    return map;
  }, [raw]);

  const expandNode = useCallback(
    async (entityId: string) => {
      setExpanding(true);
      try {
        const resp = await getGraphNeighborhood(entityId, 1);
        setExtraNodes((prev) => [...prev, ...resp.nodes]);
        setExtraEdges((prev) => [...prev, ...resp.edges]);
      } catch {
        // Expansion failure is non-critical; graph still works
      } finally {
        setExpanding(false);
      }
    },
    [],
  );

  return {
    raw,
    graphData,
    degreeMap,
    entitySeverityMap,
    signals: Array.from(new Map((raw.signals ?? []).map((s) => [s.id, s])).values()) as CaseSignalBrief[],
    seedEntityIds,
    loading: false,
    error: null,
    expanding,
    expandNode,
    erPending: raw.er_pending ?? false,
    focusSignalSummary: raw.focus_signal_summary ?? null,
    focusEntityIds,
    focusEdgeIds,
  };
}
