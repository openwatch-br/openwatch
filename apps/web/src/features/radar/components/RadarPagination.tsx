"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface RadarPaginationProps {
  offset: number;
  pageSize: number;
  total: number;
  onOffset: (offset: number) => void;
}

/** Windowed numbered pager for the radar results table. */
export function RadarPagination({ offset, pageSize, total, onOffset }: RadarPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.floor(offset / pageSize) + 1;
  if (totalPages <= 1) return null;

  const from = offset + 1;
  const to = Math.min(offset + pageSize, total);

  const pages: number[] = [];
  const start = Math.max(1, Math.min(current - 1, totalPages - 2));
  for (let p = start; p <= Math.min(totalPages, start + 2); p++) pages.push(p);

  const go = (page: number) => onOffset((page - 1) * pageSize);

  return (
    <div className="flex items-center justify-between bg-[var(--color-surface-dark-2)] px-5 py-3.5">
      <span className="font-mono text-[11px] text-[var(--color-text-3)]">
        {from}–{to} de {total.toLocaleString("pt-BR")}
      </span>
      <div className="flex gap-1.5">
        <PagerButton disabled={current <= 1} onClick={() => go(current - 1)} aria-label="Anterior">
          <ChevronLeft size={13} />
        </PagerButton>
        {pages.map((p) => (
          <PagerButton key={p} active={p === current} onClick={() => go(p)}>
            {p}
          </PagerButton>
        ))}
        <PagerButton disabled={current >= totalPages} onClick={() => go(current + 1)} aria-label="Próxima">
          <ChevronRight size={13} />
        </PagerButton>
      </div>
    </div>
  );
}

function PagerButton({
  children,
  active,
  disabled,
  onClick,
  ...rest
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-[5px] border px-2.5 text-xs transition-colors ${
        active
          ? "border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_14%,transparent)] text-[var(--color-brand-text)]"
          : "border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)] disabled:opacity-40"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}
