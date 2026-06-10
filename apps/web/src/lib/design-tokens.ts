/**
 * Design token values for JavaScript/TypeScript contexts
 * (React Flow node colors, chart rendering, canvas operations).
 * CSS custom properties in globals.css are the single source of truth.
 */

export type Theme = "dark";

function getCSSToken(varName: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export interface TokenSet {
  readonly bg: string;
  readonly fg: string;
  readonly surface: string;
  readonly border: string;
  readonly muted: string;
  readonly accent: string;
  readonly accentDim: string;
  readonly critical: string;
  readonly high: string;
  readonly medium: string;
  readonly low: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
  readonly entityPerson: string;
  readonly entityCompany: string;
  readonly entityOrg: string;
}

const fallbackTokens: TokenSet = {
  bg:            "#0D0D0F",
  fg:            "#F4F4F2",
  surface:       "#131316",
  border:        "#26262C",
  muted:         "#6E6E78",
  accent:        "#F5A623",
  accentDim:     "rgba(245, 166, 35, 0.16)",
  critical:      "#FF5C5C",
  high:          "#FF9F45",
  medium:        "#E8C547",
  low:           "#4ADE80",
  success:       "#4ADE80",
  warning:       "#E8C547",
  error:         "#FF5C5C",
  info:          "#5CA8FF",
  entityPerson:  "#A78BFA",
  entityCompany: "#F5A623",
  entityOrg:     "#5CA8FF",
};

export function getTokens(_theme?: Theme): TokenSet {
  if (typeof document === "undefined") return fallbackTokens;
  return {
    bg:            getCSSToken("--color-bg")             || fallbackTokens.bg,
    fg:            getCSSToken("--color-text")           || fallbackTokens.fg,
    surface:       getCSSToken("--color-surface")        || fallbackTokens.surface,
    border:        getCSSToken("--color-border")         || fallbackTokens.border,
    muted:         getCSSToken("--color-text-3")         || fallbackTokens.muted,
    accent:        getCSSToken("--color-brand")          || fallbackTokens.accent,
    accentDim:     getCSSToken("--color-brand-dim")      || fallbackTokens.accentDim,
    critical:      getCSSToken("--color-critical")       || fallbackTokens.critical,
    high:          getCSSToken("--color-high")           || fallbackTokens.high,
    medium:        getCSSToken("--color-medium")         || fallbackTokens.medium,
    low:           getCSSToken("--color-low")            || fallbackTokens.low,
    success:       getCSSToken("--color-success")        || fallbackTokens.success,
    warning:       getCSSToken("--color-medium")         || fallbackTokens.warning,
    error:         getCSSToken("--color-critical")       || fallbackTokens.error,
    info:          getCSSToken("--color-info")           || fallbackTokens.info,
    entityPerson:  getCSSToken("--color-entity-person")  || fallbackTokens.entityPerson,
    entityCompany: getCSSToken("--color-entity-company") || fallbackTokens.entityCompany,
    entityOrg:     getCSSToken("--color-entity-org")     || fallbackTokens.entityOrg,
  };
}

export const tokens: TokenSet = fallbackTokens;
export type SeverityLevel = "critical" | "high" | "medium" | "low";
