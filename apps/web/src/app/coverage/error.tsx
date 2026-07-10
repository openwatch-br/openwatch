"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function CoverageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-critical-border)", background: "var(--color-critical-bg)" }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-critical-text)" }} />
          <div>
            <h1 className="font-display text-lg font-semibold" style={{ color: "var(--color-critical-text)" }}>
              Falha ao carregar Cobertura
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-2)" }}>
              Detectamos um problema na comunicação com a API. A tela não foi interrompida:
              tente novamente ou abra a Saúde da API para diagnóstico.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ borderColor: "var(--color-critical-border)", background: "var(--color-surface)", color: "var(--color-critical-text)" }}
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </button>
              <Link
                href="/api-health"
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-brand-tint)]"
                style={{ borderColor: "var(--color-brand-border)", background: "var(--color-brand-tint)", color: "var(--color-brand-text)" }}
              >
                Abrir Saúde API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
