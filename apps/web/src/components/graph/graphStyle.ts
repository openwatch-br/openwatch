/* ============================================================
   NEXO · graphStyle.ts — estilo Sigma.js (WebGL) + SVG
   Fonte de verdade: "Nexo · Especificação de Grafos".
   Espelha os tokens de entidade/aresta de globals.css. Como o Sigma
   renderiza em WebGL (canvas), as cores precisam ser hex resolvidos —
   NÃO var(). Mantido em sincronia manual com :root / [data-theme].
   Consumidores SVG (CaseEgoGraph, CaseChronologicGraph) usam os helpers
   *CssVar() e herdam o tema automaticamente via var(--color-*).
   ============================================================ */

import type { GraphEdge, GraphNode } from "@/lib/types";

export type EntityType = "person" | "company" | "org" | "unknown";
export type EdgeType =
  | "ownership" // vínculo societário (sócio, quadro, subsidiária)
  | "contract" // contrato / homologação / fornecimento
  | "accountant" // contador / representante em comum
  | "donation" // doação de campanha
  | "sanction" // sanção / agente público favorecido
  | "related"; // correlação genérica (co-participação, mesmo endereço/telefone)
export type NodeState = "default" | "hover" | "selected" | "faded";
export type ThemeName = "dark" | "light";

/* ---------- Paleta por tema ---------- */
interface GraphTheme {
  background: string;
  label: string;
  labelHalo: string;
  node: Record<EntityType, string>;
  edge: Record<EdgeType, string>;
  edgeDefault: string;
  focusRing: string; // anel do nó selecionado (teal de marca)
  fadeColor: string; // nós/arestas fora do foco
}

// IMPORTANT: keep these hex values in sync with globals.css
// (:root = dark, [data-theme="light"]). --color-entity-* / --color-brand.
export const GRAPH_THEME: Record<ThemeName, GraphTheme> = {
  dark: {
    background: "#0B0C0E", // --color-surface-dark (canvas stays dark in both themes)
    label: "#ECEEEF",
    labelHalo: "#0B0C0E",
    node: {
      person: "#9D8CFF", // --color-entity-person
      company: "#E0A458", // --color-entity-company
      org: "#5CA8FF", // --color-entity-org
      unknown: "#757D84", // --color-entity-unknown
    },
    edge: {
      ownership: "#3DBDB5", // --color-brand · teal tracejado — o fio "revelador"
      contract: "#3A424A",
      accountant: "#9D8CFF",
      donation: "#5CA8FF",
      sanction: "#DB6C86",
      related: "#2A3036",
    },
    edgeDefault: "#2A3036",
    focusRing: "#3DBDB5",
    fadeColor: "#22272B",
  },
  // Light palette per the Especificação (tuned for a light #F4F5F5 canvas).
  // NOTE: the Sigma WebGL canvas itself stays dark in both app themes (page
  // mockups + Fundação: --color-surface-dark is not theme-overridden), so
  // SigmaGraph renders with the `dark` palette. This block mirrors the spec
  // for correctness and for any future light-surface graph embedding; the
  // SVG consumers get their light palette straight from CSS vars.
  light: {
    background: "#F4F5F5",
    label: "#1A1D1F",
    labelHalo: "#FFFFFF",
    node: {
      person: "#6D5BD0",
      company: "#A16A1B",
      org: "#2563C4",
      unknown: "#6E777D",
    },
    edge: {
      ownership: "#0D7C76",
      contract: "#C3C9CC",
      accountant: "#6D5BD0",
      donation: "#2563C4",
      sanction: "#B23A52",
      related: "#DDE1E3",
    },
    edgeDefault: "#C3C9CC",
    focusRing: "#0D7C76",
    fadeColor: "#E8EBEC",
  },
};

// The WebGL graph canvas is dark in both app themes → always render dark.
export const CANVAS_THEME: ThemeName = "dark";

/* ---------- Normalização de tipo de entidade ---------- */
export function normalizeEntityType(raw: string | undefined | null): EntityType {
  switch ((raw ?? "").toLowerCase()) {
    case "person":
    case "pessoa":
    case "pessoa_fisica":
      return "person";
    case "company":
    case "empresa":
    case "pessoa_juridica":
      return "company";
    case "org":
    case "orgao":
    case "órgão":
    case "organization":
      return "org";
    default:
      return "unknown";
  }
}

/* ---------- Taxonomia de arestas: string bruta do backend → semântica ----------
   Escolhas (revisáveis): identidade/quadro societário → ownership;
   contrato/fornecimento → contract; sanção/favorecimento → sanction;
   co-participação e correlações fracas (endereço/telefone) → related. */
const EDGE_TYPE_MAP: Record<string, EdgeType> = {
  // ownership — vínculo societário / identidade forte
  sociedade: "ownership",
  socio: "ownership",
  same_socio: "ownership",
  subsidiary: "ownership",
  holding: "ownership",
  same_cluster_entity: "ownership",
  quadro_societario: "ownership",
  // contract — contrato / fornecimento / homologação
  compra_fornecimento: "contract",
  contratou: "contract",
  supplier_chain: "contract",
  contrato: "contract",
  homologacao: "contract",
  // accountant — contador / representante em comum
  contador: "accountant",
  accountant: "accountant",
  representante: "accountant",
  same_accountant: "accountant",
  // donation — doação de campanha
  doacao: "donation",
  donation: "donation",
  doacao_campanha: "donation",
  // sanction — sanção / favorecimento de agente público
  agente_publico_favorecido: "sanction",
  sancao: "sanction",
  sanction: "sanction",
  // related — co-participação e correlações genéricas
  coparticipacao_evento: "related",
  co_participation: "related",
  participou: "related",
  same_address: "related",
  shares_phone: "related",
};

export function mapEdgeType(raw: string | undefined | null): EdgeType {
  if (!raw) return "related";
  return EDGE_TYPE_MAP[raw.toLowerCase()] ?? "related";
}

/* ---------- Escala de tamanho de nó (por grau) ---------- */
export const NODE_SIZE = {
  min: 4,
  max: 18,
  focus: 24, // ego / nó selecionado
  perDegree: 1.4,
} as const;

export function nodeSizeForDegree(degree: number, isEgo: boolean): number {
  if (isEgo) return NODE_SIZE.focus;
  return clamp(NODE_SIZE.min + degree * NODE_SIZE.perDegree, NODE_SIZE.min, NODE_SIZE.max);
}

/* ---------- Estilo de aresta por tipo semântico ----------
   A aresta societária (ownership) é a única sempre tracejada. */
export const EDGE_STYLE: Record<EdgeType, { size: number; dashed: boolean }> = {
  ownership: { size: 2.0, dashed: true },
  accountant: { size: 1.6, dashed: true },
  contract: { size: 1.6, dashed: false },
  donation: { size: 1.6, dashed: false },
  sanction: { size: 2.0, dashed: false },
  related: { size: 1.2, dashed: false },
};

/* Sigma edge program key: "dashed" (registrado em SigmaGraph) ou "line". */
export function edgeProgramType(type: EdgeType): "dashed" | "line" {
  return EDGE_STYLE[type].dashed ? "dashed" : "line";
}

export const STATE_ALPHA: Record<NodeState, number> = {
  default: 1,
  hover: 1,
  selected: 1,
  faded: 0.18,
};

/* ---------- Interação (hover / seleção / vizinhança em foco) ---------- */
export interface InteractionCtx {
  hoveredNode?: string | undefined;
  selectedNode?: string | undefined;
  /** nós conectados ao foco — usados para esmaecer o resto */
  focusNeighborhood?: Set<string> | undefined;
}

/* ---------- Reducers do Sigma (WebGL) ----------
   Os nós carregam { entityType, degree, isEgo, label, nodeData }.
   As arestas carregam { semantic, edgeData }.
   `ctx` é um objeto mutável mantido por SigmaGraph; ler seus campos
   em tempo de refresh permite hover/seleção sem recriar o renderer. */
export function makeNodeReducer(theme: ThemeName, ctx: InteractionCtx) {
  const t = GRAPH_THEME[theme];
  return (node: string, data: Record<string, unknown>): Record<string, unknown> => {
    const type = (data.entityType as EntityType) ?? "unknown";
    const isEgo = Boolean(data.isEgo);
    const degree = (data.degree as number) ?? 1;
    const isFocus = node === ctx.selectedNode || node === ctx.hoveredNode;
    const inFocus =
      !ctx.focusNeighborhood || ctx.focusNeighborhood.has(node) || isFocus;

    const baseSize = nodeSizeForDegree(degree, isEgo);
    const res: Record<string, unknown> = {
      ...data,
      size: baseSize,
      color: t.node[type],
      zIndex: isFocus ? 2 : 0,
    };

    if (!inFocus) {
      res.color = t.fadeColor;
      res.label = "";
      res.zIndex = 0;
    }
    // Sigma has no built-in per-node border program; approximate the teal
    // focus ring with the built-in highlight halo + a small size bump.
    if (node === ctx.selectedNode) {
      res.highlighted = true;
      res.size = baseSize + 3;
      res.zIndex = 3;
    }
    return res;
  };
}

export function makeEdgeReducer(theme: ThemeName, ctx: InteractionCtx) {
  const t = GRAPH_THEME[theme];
  return (
    _edge: string,
    data: Record<string, unknown>,
    source: string,
    target: string,
  ): Record<string, unknown> => {
    const semantic = (data.semantic as EdgeType) ?? "related";
    const style = EDGE_STYLE[semantic];
    const inFocus =
      !ctx.focusNeighborhood ||
      (ctx.focusNeighborhood.has(source) && ctx.focusNeighborhood.has(target));

    return {
      ...data,
      size: style.size,
      type: style.dashed ? "dashed" : "line",
      color: inFocus ? t.edge[semantic] : t.fadeColor,
      zIndex: inFocus ? 1 : 0,
    };
  };
}

/* Configurações estáticas do renderer. */
export function rendererSettings(theme: ThemeName): Record<string, unknown> {
  const t = GRAPH_THEME[theme];
  return {
    defaultNodeColor: t.node.unknown,
    defaultEdgeColor: t.edgeDefault,
    labelColor: { color: t.label },
    labelFont: "Red Hat Mono, ui-monospace, monospace",
    labelSize: 11,
    labelWeight: "500",
    edgeLabelColor: { color: t.label },
    labelRenderedSizeThreshold: 8,
    stagePadding: 40,
    zIndex: true,
    renderEdgeLabels: false,
  };
}

export function edgeSize(strength: string | undefined, weight: number): number {
  const base = strength === "strong" ? 2.5 : 1;
  return Math.min(5, base + Math.log1p(weight ?? 0) * 0.5);
}

/* ---------- Helpers para consumidores SVG (herdam tema via CSS vars) ---------- */
export function entityCssVar(rawType: string | undefined | null): string {
  const t = normalizeEntityType(rawType);
  return `var(--color-entity-${t})`;
}

// Semantic edge → CSS var (SVG). ownership = teal de marca ("fio revelador").
const EDGE_CSS_VAR: Record<EdgeType, string> = {
  ownership: "var(--color-brand)",
  accountant: "var(--color-entity-person)",
  contract: "var(--color-border-strong)",
  donation: "var(--color-entity-org)",
  sanction: "var(--color-status-error)",
  related: "var(--color-border-strong)",
};

export function edgeCssVar(rawType: string | undefined | null): string {
  return EDGE_CSS_VAR[mapEdgeType(rawType)];
}

export function isOwnershipEdge(rawType: string | undefined | null): boolean {
  const s = mapEdgeType(rawType);
  return s === "ownership" || s === "accountant";
}

/* ---------- Attribute builders (compartilhados pelos consumidores WebGL) ---------- */
export function nodeAttributes(n: GraphNode, centerNodeId?: string) {
  return {
    label: n.label,
    entityType: normalizeEntityType(n.node_type),
    isEgo: n.id === centerNodeId,
    color: GRAPH_THEME.dark.node[normalizeEntityType(n.node_type)],
    size: n.id === centerNodeId ? NODE_SIZE.focus : NODE_SIZE.min,
    nodeData: n,
  };
}

export function edgeAttributes(e: GraphEdge) {
  const semantic = mapEdgeType(e.type);
  return {
    label: e.type,
    semantic,
    size: EDGE_STYLE[semantic].size,
    type: EDGE_STYLE[semantic].dashed ? "dashed" : "line",
    color: GRAPH_THEME.dark.edge[semantic],
    edgeData: e,
  };
}

/* util */
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/* ---------- Legenda (render fora do canvas) ---------- */
export const NODE_LEGEND: Array<{ type: EntityType; label: string }> = [
  { type: "person", label: "Pessoa" },
  { type: "company", label: "Empresa" },
  { type: "org", label: "Órgão" },
  { type: "unknown", label: "Outro" },
];

export const EDGE_LEGEND: Array<{ type: EdgeType; label: string; dashed: boolean }> = [
  { type: "ownership", label: "Vínculo societário", dashed: true },
  { type: "contract", label: "Contrato / participação", dashed: false },
  { type: "sanction", label: "Sanção", dashed: false },
  { type: "donation", label: "Doação de campanha", dashed: false },
];
