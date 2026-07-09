import Link from "next/link";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { WorklistRow } from "./WorklistRow";
import type { WorklistItem } from "../useHomeData";

interface HomeWorklistProps {
  items: WorklistItem[];
  loading: boolean;
  error: boolean;
}

/**
 * "Precisa da sua atenção" — the triaged worklist. Replaces the old
 * chronological feed with a priority-ranked list answering "what now?".
 */
export function HomeWorklist({ items, loading, error }: HomeWorklistProps) {
  return (
    <div className="border-b border-[var(--color-border-subtle)] px-4 py-6 sm:border-b-0 sm:border-r sm:px-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)] sm:text-xl">
          Precisa da sua atenção
        </h2>
        <Link
          href="/radar"
          className="shrink-0 text-xs text-[var(--color-brand-text)] hover:text-[var(--color-text)]"
        >
          ver todo o radar ›
        </Link>
      </div>
      <p className="mb-2 mt-1.5 text-[12.5px] text-[var(--color-text-3)]">
        Casos triados por severidade × novidade × valor.
      </p>

      {loading ? (
        <div className="space-y-3 pt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} rows={2} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Não foi possível carregar" description="Tente novamente em instantes." />
      ) : items.length === 0 ? (
        <EmptyState title="Nada na fila" description="Nenhum caso ativo no momento." />
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <WorklistRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
