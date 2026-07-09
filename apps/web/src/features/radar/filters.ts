import {
  SEVERITY_LABELS,
  TYPOLOGY_LABELS,
  CORRUPTION_TYPE_LABELS,
  SPHERE_LABELS,
} from "@/lib/constants";

export type RadarView = "cases" | "signals" | "raw";

export type FilterKey =
  | "severity"
  | "typology"
  | "corruptionType"
  | "sphere"
  | "uf"
  | "period";

export interface RadarFilters {
  severity: string;
  typology: string;
  corruptionType: string;
  sphere: string;
  uf: string;
  periodFrom: string;
  periodTo: string;
}

export const EMPTY_FILTERS: RadarFilters = {
  severity: "",
  typology: "",
  corruptionType: "",
  sphere: "",
  uf: "",
  periodFrom: "",
  periodTo: "",
};

/** A resolved chip in the composable query sentence. */
export interface SentenceChip {
  key: FilterKey;
  /** Grammatical connective preceding the chip ("de severidade", "em"…). */
  connective: string;
  label: string;
}

function periodLabel(from: string, to: string): string | null {
  if (from && to) return `${from} até ${to}`;
  if (from) return `desde ${from}`;
  if (to) return `até ${to}`;
  return null;
}

/** Build the ordered list of active chips for the query sentence. */
export function sentenceChips(f: RadarFilters): SentenceChip[] {
  const chips: SentenceChip[] = [];
  if (f.severity)
    chips.push({ key: "severity", connective: "de severidade", label: SEVERITY_LABELS[f.severity] ?? f.severity });
  if (f.typology)
    chips.push({ key: "typology", connective: "do tipo", label: `${f.typology} · ${TYPOLOGY_LABELS[f.typology] ?? ""}`.trim() });
  if (f.corruptionType)
    chips.push({ key: "corruptionType", connective: "de", label: CORRUPTION_TYPE_LABELS[f.corruptionType] ?? f.corruptionType });
  if (f.sphere)
    chips.push({ key: "sphere", connective: "na esfera", label: SPHERE_LABELS[f.sphere] ?? f.sphere });
  if (f.uf) chips.push({ key: "uf", connective: "em", label: f.uf.toUpperCase() });
  const period = periodLabel(f.periodFrom, f.periodTo);
  if (period) chips.push({ key: "period", connective: "no período", label: period });
  return chips;
}

/** Which conditions can still be added (not already active). */
export function availableConditions(f: RadarFilters): FilterKey[] {
  const all: FilterKey[] = ["severity", "typology", "corruptionType", "sphere", "uf", "period"];
  const active = new Set(sentenceChips(f).map((c) => c.key));
  return all.filter((k) => !active.has(k));
}

/** Confidence bands (ER score, 0–100) — mirror the ConfidenceBadge thresholds. */
export type ConfBand = "confirmed" | "corroborated" | "correlated" | "heuristic";

export const CONF_BANDS: { id: ConfBand; label: string; min: number; max: number }[] = [
  { id: "confirmed", label: "Confirmada", min: 95, max: 100 },
  { id: "corroborated", label: "Corroborada", min: 80, max: 94.999 },
  { id: "correlated", label: "Correlacionada", min: 60, max: 79.999 },
  { id: "heuristic", label: "Heurística", min: 0, max: 59.999 },
];

/** Whether a score falls in the selected band (empty band = pass-through). */
export function confInBand(score: number | null | undefined, band: string): boolean {
  if (!band) return true;
  if (score == null) return false;
  const b = CONF_BANDS.find((x) => x.id === band);
  return !!b && score >= b.min && score <= b.max;
}

export const CONDITION_LABEL: Record<FilterKey, string> = {
  severity: "Severidade",
  typology: "Tipologia",
  corruptionType: "Tipo de corrupção",
  sphere: "Esfera",
  uf: "UF",
  period: "Período",
};
