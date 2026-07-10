"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { formatBRL, formatDate } from "@/lib/utils";
import type { TimelineEventDTO, TimelineSignalDTO } from "@/lib/types";

const SEV_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

function confidenceOf(signal: TimelineSignalDTO): number | null {
  if (signal.signal_confidence_score != null) return signal.signal_confidence_score;
  if (signal.confidence != null) return Math.round(signal.confidence * 100);
  return null;
}

interface Props {
  signal: TimelineSignalDTO;
  events: TimelineEventDTO[];
  index: number;
  defaultOpen?: boolean;
}

/**
 * One achado, read in full without leaving the dossiê. Collapsed it shows the
 * verdict line (severity · typology · confidence · value); expanded it carries
 * the whole laudo — what the data shows, what it may indicate, what it does not
 * assert — plus the evidence that backs it. First achado opens by default; the
 * rest stay closed so the page reads as a table of contents you drill into.
 */
export function DossieSignalAccordion({ signal, events, index, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `laudo-${signal.id}`;
  const conf = confidenceOf(signal);
  const clampedConf = conf != null ? Math.max(0, Math.min(100, conf)) : null;

  const value = events.reduce((sum, e) => sum + (e.value_brl ?? 0), 0);
  const factors = Object.values(signal.factor_descriptions ?? {});

  return (
    <article id={`sig-${signal.id}`} className="ow-laudo scroll-mt-[calc(var(--shell-height)+16px)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="ow-laudo-head"
      >
        <span className="ow-laudo-num font-mono">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] text-[var(--color-text-3)]">{signal.typology_code}</span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: `var(--color-${signal.severity})` }}
            >
              <SeverityGlyph severity={signal.severity} size="sm" />
              {SEV_LABEL[signal.severity] ?? signal.severity}
            </span>
            {conf != null && <ConfidenceBadge score={conf} />}
          </span>
          <span className="text-left font-display text-[16px] font-semibold leading-snug text-[var(--color-text)]">
            {signal.title}
          </span>
        </span>
        <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          {value > 0 && (
            <span className="font-mono text-[12px] text-[var(--color-text-2)]">{formatBRL(value)}</span>
          )}
          <span className="font-mono text-[10.5px] text-[var(--color-text-3)]">
            {signal.event_count} evento{signal.event_count === 1 ? "" : "s"}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[var(--color-text-3)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={panelId} className="ow-laudo-body">
          {/* What the data shows */}
          <section className="ow-laudo-field">
            <h4 className="ow-laudo-eyebrow">
              <span className="ow-laudo-step" data-tone="show">1</span> O que os dados mostram
            </h4>
            <p className="ow-laudo-text">{signal.summary ?? signal.title}</p>
            {factors.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {factors.map((f, i) => (
                  <li
                    key={i}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--color-text-2)]"
                  >
                    {f.label}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* What it may indicate */}
          <section className="ow-laudo-field">
            <h4 className="ow-laudo-eyebrow">
              <span className="ow-laudo-step" data-tone="indicate">2</span> O que isto pode indicar
            </h4>
            <p className="ow-laudo-text">
              Um padrão de <strong className="font-semibold text-[var(--color-text)]">{signal.typology_name}</strong> que,
              à luz dos dados públicos, merece apuração formal pelos órgãos de controle competentes.
            </p>
          </section>

          {/* What it does not assert */}
          <section className="ow-laudo-field">
            <h4 className="ow-laudo-eyebrow">
              <span className="ow-laudo-step" data-tone="deny">3</span> O que isto não afirma
            </h4>
            <p className="ow-laudo-text">
              Não afirma dolo, fraude ou culpa. É um indício estatístico derivado de dados abertos — requer
              apuração, não constitui condenação.
            </p>
          </section>

          {/* Evidence */}
          {events.length > 0 && (
            <section className="ow-laudo-field">
              <h4 className="ow-laudo-eyebrow ow-laudo-eyebrow-plain">
                Evidências · {events.length}
              </h4>
              <ul className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
                {events.slice(0, 12).map((e) => (
                  <li key={e.id} className="flex items-baseline justify-between gap-4 py-2">
                    <span className="min-w-0 truncate text-[12.5px] text-[var(--color-text-2)]">
                      {e.description || e.type}
                    </span>
                    <span className="flex shrink-0 items-baseline gap-3 font-mono text-[11px] text-[var(--color-text-3)]">
                      {e.value_brl != null && e.value_brl > 0 && <span>{formatBRL(e.value_brl)}</span>}
                      {e.occurred_at && <span>{formatDate(e.occurred_at)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {events.length > 12 && (
                <p className="mt-2 font-mono text-[10.5px] text-[var(--color-text-3)]">
                  + {events.length - 12} outros eventos
                </p>
              )}
            </section>
          )}

          {/* Confidence */}
          {clampedConf != null && (
            <section className="ow-laudo-field ow-laudo-score">
              <div className="flex items-center justify-between">
                <span className="ow-laudo-eyebrow ow-laudo-eyebrow-plain">Score de confiança</span>
                <span className="font-mono text-[13px] font-semibold text-[var(--color-text)] tabular-nums">
                  {clampedConf} / 100
                </span>
              </div>
              <div className="relative mt-2 h-1.5 rounded-full bg-[var(--color-border-subtle)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${clampedConf}%`, background: "var(--color-brand)" }}
                />
                {[60, 80, 95].map((t) => (
                  <div
                    key={t}
                    className="absolute -top-[3px] -bottom-[3px] w-px bg-[var(--color-border-strong)]"
                    style={{ left: `${t}%` }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
