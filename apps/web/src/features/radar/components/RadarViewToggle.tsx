"use client";

import type { RadarView } from "../filters";

const OPTIONS: { id: RadarView; label: string }[] = [
  { id: "cases", label: "Casos" },
  { id: "signals", label: "Sinais" },
  { id: "raw", label: "Registro bruto" },
];

interface RadarViewToggleProps {
  value: RadarView;
  onChange: (v: RadarView) => void;
}

/**
 * Casos ↔ Sinais ↔ Registro bruto — progressive density on one surface:
 * editorial grouping → per-signal → raw record.
 */
export function RadarViewToggle({ value, onChange }: RadarViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Modo de visualização"
      className="flex gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5"
    >
      {OPTIONS.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-[var(--color-surface-2)] font-semibold text-[var(--color-text)]"
                : "text-[var(--color-text-3)] hover:text-[var(--color-text-2)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
