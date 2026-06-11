"use client";

// Filtros do índice de sinais (doc §3.4, passo 1): tipologia, período,
// UF, órgão e severidade — estado sincronizado com a URL pela página.

import { useQuery } from "@tanstack/react-query";

import { fetchTipologiaList } from "@/lib/api";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const SEVERITIES = [
  { value: "critical", label: "Crítico" },
  { value: "high", label: "Alto" },
  { value: "medium", label: "Médio" },
  { value: "low", label: "Baixo" },
];

export interface SignalFilterValues {
  typology: string;
  severity: string;
  uf: string;
  period_from: string;
  period_to: string;
}

const selectCls =
  "rounded-lg border border-border bg-surface-card px-2 py-1.5 text-xs text-primary focus:border-accent focus:outline-none";

export function SignalFilters({
  values,
  onChange,
}: {
  values: SignalFilterValues;
  onChange: (next: Partial<SignalFilterValues>) => void;
}) {
  const tipologias = useQuery({
    queryKey: ["tipologia-list"],
    queryFn: fetchTipologiaList,
    staleTime: 60 * 60 * 1000,
  });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Tipologia
        <select
          className={selectCls}
          value={values.typology}
          onChange={(e) => onChange({ typology: e.target.value })}
        >
          <option value="">Todas</option>
          {(tipologias.data ?? []).map((t) => (
            <option key={t.code} value={t.code}>
              {t.code} — {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Severidade
        <select
          className={selectCls}
          value={values.severity}
          onChange={(e) => onChange({ severity: e.target.value })}
        >
          <option value="">Todas</option>
          {SEVERITIES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        UF
        <select
          className={selectCls}
          value={values.uf}
          onChange={(e) => onChange({ uf: e.target.value })}
        >
          <option value="">Todas</option>
          {UFS.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        De
        <input
          type="date"
          className={selectCls}
          value={values.period_from}
          onChange={(e) => onChange({ period_from: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Até
        <input
          type="date"
          className={selectCls}
          value={values.period_to}
          onChange={(e) => onChange({ period_to: e.target.value })}
        />
      </label>
    </div>
  );
}
