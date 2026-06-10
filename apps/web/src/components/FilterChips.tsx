"use client";

import { clsx } from "clsx";

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
  /** Optional accent color for the count (e.g. severity color) */
  color?: string;
}

interface FilterChipsProps {
  options: FilterChipOption[];
  /** Currently selected option id ("" = none/all) */
  value: string;
  onChange: (id: string) => void;
  "aria-label"?: string;
}

export function FilterChips({ options, value, onChange, ...rest }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={rest["aria-label"]}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={clsx("ow-chip", active && "active")}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className="font-bold tabular-nums"
                style={opt.color ? { color: opt.color } : undefined}
              >
                {opt.count.toLocaleString("pt-BR")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
