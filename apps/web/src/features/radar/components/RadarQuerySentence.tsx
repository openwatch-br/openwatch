"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import {
  SEVERITY_LABELS,
  TYPOLOGY_LABELS,
  CORRUPTION_TYPE_LABELS,
  SPHERE_LABELS,
} from "@/lib/constants";
import {
  sentenceChips,
  availableConditions,
  CONDITION_LABEL,
  type RadarFilters,
  type FilterKey,
  type RadarView,
} from "../filters";
import { RadarViewToggle } from "./RadarViewToggle";

const VIEW_WORD: Record<RadarView, string> = {
  cases: "casos",
  signals: "sinais",
  raw: "registros",
};

interface RadarQuerySentenceProps {
  view: RadarView;
  onViewChange: (v: RadarView) => void;
  filters: RadarFilters;
  onSet: (patch: Partial<RadarFilters>) => void;
  onRemove: (key: FilterKey) => void;
  countLabel: string;
  snapshotLabel: string;
  onSaveRecorte: () => void;
}

/**
 * The composable query sentence — filters read as natural language, and each
 * facet is an editable chip. "+ condição" adds a real, API-backed condition.
 * This replaces the sidebar filter form with an investigator's reading of the
 * current slice.
 */
export function RadarQuerySentence({
  view,
  onViewChange,
  filters,
  onSet,
  onRemove,
  countLabel,
  snapshotLabel,
  onSaveRecorte,
}: RadarQuerySentenceProps) {
  const chips = sentenceChips(filters);
  const addable = availableConditions(filters);

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<FilterKey | "">("");
  const [value, setValue] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const reset = () => {
    setPending("");
    setValue("");
    setFrom("");
    setTo("");
  };

  const apply = () => {
    if (!pending) return;
    if (pending === "period") {
      if (from || to) onSet({ periodFrom: from, periodTo: to });
    } else if (value) {
      onSet({ [pending]: value } as Partial<RadarFilters>);
    }
    setOpen(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-3.5 border-b border-[var(--color-border-subtle)] px-4 py-5 sm:px-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-wrap items-center gap-2 text-[14.5px] leading-loose text-[var(--color-text-2)]">
          <span>Mostrar</span>
          <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 font-semibold text-[var(--color-text)]">
            {VIEW_WORD[view]}
          </span>

          {chips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-2">
              <span>{chip.connective}</span>
              <span className="inline-flex items-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--color-brand)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-brand)_14%,transparent)] py-1 pl-2.5 pr-1.5 font-semibold text-[var(--color-brand-text)]">
                {chip.label}
                <button
                  type="button"
                  aria-label={`Remover ${CONDITION_LABEL[chip.key]}`}
                  onClick={() => onRemove(chip.key)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded bg-[color-mix(in_srgb,var(--color-brand)_20%,transparent)] text-[10px] hover:text-[var(--color-text)]"
                >
                  <X size={10} />
                </button>
              </span>
            </span>
          ))}

          {chips.length === 0 && <span className="text-[var(--color-text-3)]">— todos os recortes</span>}

          {/* + condição */}
          {addable.length > 0 && (
            <div className="relative" ref={ref}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-[var(--color-border-strong)] px-2.5 py-1 text-[13px] text-[var(--color-text-2)] transition-colors hover:border-[var(--color-brand-text)] hover:text-[var(--color-text)]"
              >
                <Plus size={12} /> condição
              </button>

              {open && (
                <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg">
                  <label className="ow-label">Condição</label>
                  <select
                    className="ow-select mb-3"
                    value={pending}
                    onChange={(e) => {
                      setPending(e.target.value as FilterKey);
                      setValue("");
                    }}
                  >
                    <option value="">Escolher…</option>
                    {addable.map((k) => (
                      <option key={k} value={k}>
                        {CONDITION_LABEL[k]}
                      </option>
                    ))}
                  </select>

                  {pending === "severity" && (
                    <SelectValue value={value} onChange={setValue} entries={Object.entries(SEVERITY_LABELS)} />
                  )}
                  {pending === "typology" && (
                    <SelectValue
                      value={value}
                      onChange={setValue}
                      entries={Object.entries(TYPOLOGY_LABELS).map(([c, l]) => [c, `${c} — ${l}`])}
                    />
                  )}
                  {pending === "corruptionType" && (
                    <SelectValue value={value} onChange={setValue} entries={Object.entries(CORRUPTION_TYPE_LABELS)} />
                  )}
                  {pending === "sphere" && (
                    <SelectValue value={value} onChange={setValue} entries={Object.entries(SPHERE_LABELS)} />
                  )}
                  {pending === "uf" && (
                    <input
                      className="ow-input mb-3 uppercase"
                      maxLength={2}
                      placeholder="UF (ex.: CE)"
                      value={value}
                      onChange={(e) => setValue(e.target.value.toUpperCase())}
                    />
                  )}
                  {pending === "period" && (
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <input type="date" className="ow-input" value={from} onChange={(e) => setFrom(e.target.value)} />
                      <input type="date" className="ow-input" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={apply}
                    disabled={!pending || (pending === "period" ? !from && !to : !value)}
                    className="ow-btn ow-btn-primary ow-btn-sm w-full"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSaveRecorte}
          className="ow-btn ow-btn-secondary ow-btn-sm shrink-0 self-start"
        >
          Salvar recorte
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-[var(--color-text)]">{countLabel}</span>
        <span className="font-mono text-xs text-[var(--color-text-3)]">· {snapshotLabel}</span>
        <div className="ml-auto">
          <RadarViewToggle value={view} onChange={onViewChange} />
        </div>
      </div>
    </div>
  );
}

function SelectValue({
  value,
  onChange,
  entries,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: [string, string][];
}) {
  return (
    <select className="ow-select mb-3" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Escolher…</option>
      {entries.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
