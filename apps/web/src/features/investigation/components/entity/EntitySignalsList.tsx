"use client";

// Lista de sinais vinculados à entidade (Nexo) — abaixo do ego-graph.
// Cada linha: glifo de severidade (não depende de cor) + código da
// tipologia + título + período.

import Link from "next/link";
import { Activity } from "lucide-react";
import { SeverityGlyph } from "@/components/SeverityGlyph";
import { EmptyState } from "@/components/EmptyState";
import type { RadarV2SignalItem } from "@/lib/types";

export function EntitySignalsList({ signals }: { signals: RadarV2SignalItem[] | null }) {
  return (
    <section>
      <p
        className="mb-3 text-mono-xs uppercase tracking-widest"
        style={{ color: "var(--color-text-3)" }}
      >
        Sinais vinculados{signals ? ` · ${signals.length}` : ""}
      </p>

      {signals === null && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded"
              style={{ background: "var(--color-surface-2)" }}
            />
          ))}
        </div>
      )}

      {signals !== null && signals.length === 0 && (
        <EmptyState
          icon={Activity}
          title="Nenhum sinal detectado"
          description="Esta entidade não possui sinais de risco identificados nos dados analisados."
        />
      )}

      {signals !== null && signals.length > 0 && (
        <div className="flex flex-col">
          {signals.map((sig) => (
            <Link
              key={sig.id}
              href={`/signal/${sig.id}`}
              className="ow-card-hover flex items-center gap-3.5 border-t py-3 transition-colors"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="shrink-0" style={{ color: `var(--color-${sig.severity})` }}>
                <SeverityGlyph severity={sig.severity} />
              </span>
              <span
                className="shrink-0 rounded-sm border px-1.5 py-0.5 text-mono-xs"
                style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text-2)" }}
              >
                {sig.typology_code}
              </span>
              <span
                className="flex-1 truncate text-sm"
                style={{ color: "var(--color-text)" }}
              >
                {sig.typology_name}
              </span>
              <span
                className="w-20 shrink-0 text-right text-mono-xs"
                style={{ color: "var(--color-text-3)" }}
              >
                {sig.period_start
                  ? new Date(sig.period_start).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                  : "—"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
