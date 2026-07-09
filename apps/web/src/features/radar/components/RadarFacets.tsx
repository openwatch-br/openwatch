"use client";

import { Check } from "lucide-react";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { TYPOLOGY_LABELS } from "@/lib/constants";
import type { RadarV2SeverityCounts, RadarV2TypologyCount, SignalSeverity } from "@/lib/types";
import { CONF_BANDS, type ConfBand } from "../filters";

const SEV_ORDER: SignalSeverity[] = ["critical", "high", "medium", "low"];
const SEV_LABEL: Record<SignalSeverity, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

const CONF_DOT: Record<ConfBand, string> = {
  confirmed: "bg-[var(--color-conf-high)]",
  corroborated: "bg-[var(--color-conf-high)] opacity-55",
  correlated: "border-[1.5px] border-solid border-[var(--color-conf-partial)]",
  heuristic: "border-[1.5px] border-dashed border-[var(--color-conf-heuristic)]",
};

interface RadarFacetsProps {
  severityCounts: RadarV2SeverityCounts | undefined;
  activeSeverity: string;
  onSeverity: (sev: string) => void;
  typologies: RadarV2TypologyCount[];
  activeTypology: string;
  onTypology: (code: string) => void;
  confBand: string;
  onConfBand: (band: string) => void;
  showConfidence: boolean;
}

function FacetTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-3)]">
      {children}
    </div>
  );
}

/**
 * Faceted sidebar with mini-distributions — the investigator sees the shape of
 * the data before filtering. Severity + typology counts are real (radar
 * summary); confidence is a client-side refinement of the visible rows.
 */
export function RadarFacets({
  severityCounts,
  activeSeverity,
  onSeverity,
  typologies,
  activeTypology,
  onTypology,
  confBand,
  onConfBand,
  showConfidence,
}: RadarFacetsProps) {
  const topTypologies = [...typologies].sort((a, b) => b.count - a.count);
  const maxTypology = Math.max(1, ...topTypologies.slice(0, 6).map((t) => t.count));
  const remaining = topTypologies.length - 6;

  return (
    <div className="flex flex-col gap-6">
      {/* Severity */}
      <div>
        <FacetTitle>Severidade</FacetTitle>
        <div className="flex flex-col gap-2.5">
          {SEV_ORDER.map((sev) => {
            const checked = activeSeverity === sev;
            const count = severityCounts?.[sev] ?? 0;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => onSeverity(checked ? "" : sev)}
                className="flex items-center gap-2.5 text-left"
              >
                <span
                  className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded border-[1.5px] ${
                    checked
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-brand-ink)]"
                      : "border-[var(--color-border-strong)]"
                  }`}
                >
                  {checked && <Check size={10} strokeWidth={3} />}
                </span>
                <span className="shrink-0" style={{ color: `var(--color-${sev})` }}>
                  <SeverityGlyph severity={sev} size="sm" />
                </span>
                <span
                  className={`flex-1 text-[12.5px] ${
                    checked ? "text-[var(--color-text)]" : "text-[var(--color-text-2)]"
                  }`}
                >
                  {SEV_LABEL[sev]}
                </span>
                <span className="font-mono text-[10.5px] text-[var(--color-text-3)]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typology */}
      <div>
        <FacetTitle>Tipologia · top 6</FacetTitle>
        <div className="flex flex-col gap-2.5">
          {topTypologies.slice(0, 6).map((t) => {
            const active = activeTypology === t.code;
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => onTypology(active ? "" : t.code)}
                className="flex flex-col gap-1.5 text-left"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] text-[var(--color-text-3)]">{t.code}</span>
                  <span
                    className={`flex-1 truncate text-xs ${
                      active ? "text-[var(--color-brand-text)]" : "text-[var(--color-text-2)]"
                    }`}
                  >
                    {TYPOLOGY_LABELS[t.code] ?? t.name}
                  </span>
                  <span className="font-mono text-[10.5px] text-[var(--color-text)]">{t.count}</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
                  <div
                    className="h-full bg-[var(--color-brand)]"
                    style={{ width: `${(t.count / maxTypology) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
          {remaining > 0 && (
            <span className="text-[11.5px] text-[var(--color-text-3)]">
              + {remaining} tipologias
            </span>
          )}
        </div>
      </div>

      {/* Confidence */}
      {showConfidence && (
        <div>
          <FacetTitle>Confiança</FacetTitle>
          <div className="flex flex-col gap-2.5">
            {CONF_BANDS.map((b) => {
              const active = confBand === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onConfBand(active ? "" : b.id)}
                  className="flex items-center gap-2.5 text-left"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${CONF_DOT[b.id]}`} />
                  <span
                    className={`flex-1 text-[12.5px] ${
                      active ? "text-[var(--color-text)]" : "text-[var(--color-text-2)]"
                    }`}
                  >
                    {b.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
