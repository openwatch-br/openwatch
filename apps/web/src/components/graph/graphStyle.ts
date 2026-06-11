// Mapeamento de cores/estilo do grafo — espelha os tokens de app/globals.css.
// Sigma renderiza em WebGL (canvas), então os valores precisam ser hex
// resolvidos, não var() — manter em sincronia com :root.

export const NODE_COLORS: Record<string, string> = {
  person: "#A78BFA",
  company: "#F5A623",
  empresa: "#F5A623",
  org: "#5CA8FF",
  orgao: "#5CA8FF",
};

export const NODE_COLOR_FALLBACK = "#6E6E78";

export const EDGE_COLORS: Record<string, string> = {
  compra_fornecimento: "#5CA8FF",
  agente_publico_favorecido: "#FF5C5C",
  coparticipacao_evento: "#A78BFA",
  co_participation: "#A78BFA",
  supplier_chain: "#5CA8FF",
  sociedade: "#4ADE80",
  SAME_SOCIO: "#34D3C8",
  SAME_ADDRESS: "#6E6E78",
  SHARES_PHONE: "#6E6E78",
  SUBSIDIARY: "#A78BFA",
  HOLDING: "#A78BFA",
  same_cluster_entity: "#34D3C8",
};

export const EDGE_COLOR_FALLBACK = "#3A3A42";

export function nodeColor(nodeType: string): string {
  return NODE_COLORS[nodeType] ?? NODE_COLOR_FALLBACK;
}

export function edgeColor(edgeType: string): string {
  return EDGE_COLORS[edgeType] ?? EDGE_COLOR_FALLBACK;
}

export function edgeSize(strength: string, weight: number): number {
  const base = strength === "strong" ? 2.5 : 1;
  return Math.min(5, base + Math.log1p(weight) * 0.5);
}
