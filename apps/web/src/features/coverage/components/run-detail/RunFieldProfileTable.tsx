"use client";

import { useState } from "react";
import { Braces, ChevronDown, ChevronUp } from "lucide-react";
import type { IngestRunFieldProfile } from "@/lib/types";
import { coverageColor, formatStructuredValue, shouldRenderAsBlock } from "@/features/coverage/lib/runDetailFormat";

function FieldProfileRow({ field, total }: { field: IngestRunFieldProfile; total: number }) {
  return (
    <tr className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
      <td className="px-4 py-3 align-top">
        <code className="rounded-md border px-1.5 py-0.5 font-mono text-xs" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)", color: "var(--color-brand-text)" }}>
          {field.key}
        </code>
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "var(--color-surface-2)" }}>
            <div className="h-full transition-all" style={{ width: `${Math.min(field.coverage_pct, 100)}%`, background: coverageColor(field.coverage_pct) }} />
          </div>
          <span className="font-mono text-xs font-bold tabular-nums" style={{ color: "var(--color-text)" }}>{field.coverage_pct}%</span>
          <span className="font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>({field.present_count}/{total})</span>
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-wrap gap-1">
          {field.detected_types.map((t) => (
            <span key={t} className="ow-badge ow-badge-signal font-mono text-[10px] font-bold">{t}</span>
          ))}
        </div>
      </td>
      <td className="max-w-xs px-4 py-3 align-top">
        <div className="space-y-1.5">
          {field.examples.length === 0 ? (
            <span className="font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>—</span>
          ) : (
            field.examples.map((ex, i) => {
              const display = formatStructuredValue(ex);
              return shouldRenderAsBlock(display) ? (
                <pre key={i} className="max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-lg border px-2 py-1.5 font-mono text-[10px] leading-relaxed" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)", color: "var(--color-text-2)" }}>
                  {display}
                </pre>
              ) : (
                <p key={i} className="break-words rounded-lg border px-2 py-1.5 font-mono text-[10px]" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)", color: "var(--color-text-2)" }}>
                  {display}
                </p>
              );
            })
          )}
        </div>
      </td>
    </tr>
  );
}

interface RunFieldProfileTableProps {
  fields: IngestRunFieldProfile[];
  sampledRecords: number;
  sampleLimit: number;
  supportsIncremental?: boolean | null;
}

/** Collapsible per-field presence/type profile for a completed ingest run. */
export function RunFieldProfileTable({ fields, sampledRecords, sampleLimit, supportsIncremental }: RunFieldProfileTableProps) {
  const [open, setOpen] = useState(false);
  if (fields.length === 0) return null;

  return (
    <section className="ow-card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-2)]">
        <div className="flex items-center gap-2.5">
          <Braces className="h-4 w-4" style={{ color: "var(--color-brand-text)" }} />
          <div>
            <p className="font-display text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Perfil dos campos
              <span className="ml-2 font-mono text-xs font-normal" style={{ color: "var(--color-text-3)" }}>({fields.length})</span>
            </p>
            <p className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>
              Presença e tipos de cada campo — {sampledRecords} registros amostrados
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-3)" }} /> : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-3)" }} />}
      </button>

      {open && (
        <div className="border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b" style={{ background: "var(--color-canvas)", borderColor: "var(--color-border)" }}>
                <tr>
                  {["Campo", "Cobertura", "Tipo(s)", "Exemplos"].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, idx) => (
                  <FieldProfileRow key={`${idx}-${field.key}`} field={field} total={sampledRecords} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t px-5 py-3" style={{ borderColor: "var(--color-border)", background: "var(--color-canvas)" }}>
            <p className="font-mono text-[10px]" style={{ color: "var(--color-text-3)" }}>
              Cobertura: verde ≥90%, amarelo ≥50%, vermelho &lt;50% · Amostrado sobre {sampledRecords}/{sampleLimit} registros
              {supportsIncremental && " · Job suporta ingestão incremental"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
