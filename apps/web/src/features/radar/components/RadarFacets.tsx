"use client";

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

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 font-ui text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-3)]">
      {children}
    </span>
  );
}

/**
 * Horizontal filter rail — sits directly above the case table. Severity and
 * typology counts are real (radar summary); confidence is a client-side
 * refinement of the visible rows. Each group is a row of toggle chips so the
 * investigator scans and filters without leaving the table's eyeline.
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
  const topTypologies = [...typologies].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="flex flex-col gap-3">
      {/* Severity + Confidence share a row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <GroupLabel>Severidade</GroupLabel>
          <div className="flex flex-wrap items-center gap-1.5">
            {SEV_ORDER.map((sev) => {
              const active = activeSeverity === sev;
              const count = severityCounts?.[sev] ?? 0;
              return (
                <button
                  key={sev}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSeverity(active ? "" : sev)}
                  className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1 text-[12px] transition-colors ${
                    active
                      ? "border-[var(--color-brand-border)] bg-[var(--color-brand-tint)] text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <span style={{ color: `var(--color-${sev})` }}>
                    <SeverityGlyph severity={sev} size="sm" />
                  </span>
                  {SEV_LABEL[sev]}
                  <span className="font-mono text-[10.5px] text-[var(--color-text-3)]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {showConfidence && (
          <div className="flex items-center gap-2">
            <GroupLabel>Confiança</GroupLabel>
            <div className="flex flex-wrap items-center gap-1.5">
              {CONF_BANDS.map((b) => {
                const active = confBand === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onConfBand(active ? "" : b.id)}
                    className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1 text-[12px] transition-colors ${
                      active
                        ? "border-[var(--color-brand-border)] bg-[var(--color-brand-tint)] text-[var(--color-text)]"
                        : "border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${CONF_DOT[b.id]}`} />
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Typology chips */}
      <div className="flex items-center gap-2">
        <GroupLabel>Tipologia</GroupLabel>
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {topTypologies.map((t) => {
            const active = activeTypology === t.code;
            return (
              <button
                key={t.code}
                type="button"
                aria-pressed={active}
                onClick={() => onTypology(active ? "" : t.code)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1 text-[12px] transition-colors ${
                  active
                    ? "border-[var(--color-brand-border)] bg-[var(--color-brand-tint)] text-[var(--color-text)]"
                    : "border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                }`}
                title={TYPOLOGY_LABELS[t.code] ?? t.name}
              >
                <span className="font-mono text-[10px] text-[var(--color-text-3)]">{t.code}</span>
                <span className="max-w-[13rem] truncate">{TYPOLOGY_LABELS[t.code] ?? t.name}</span>
                <span className="font-mono text-[10.5px] text-[var(--color-text-3)]">{t.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
