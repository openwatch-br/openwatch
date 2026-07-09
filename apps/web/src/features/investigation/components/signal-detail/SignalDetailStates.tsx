"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/** Nexo forensic skeleton — mirrors the header + 2-column bench shape. */
export function SignalDetailSkeleton() {
  return (
    <div>
      <div className="border-b border-border-subtle px-6 py-7 sm:px-8">
        <div className="mb-3 flex gap-2">
          {[64, 90, 110].map((w) => (
            <div key={w} className="h-6 animate-pulse rounded-full bg-surface-subtle" style={{ width: w }} />
          ))}
        </div>
        <div className="h-9 w-2/3 animate-pulse rounded-lg bg-surface-subtle" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-6 border-border-subtle px-6 py-7 sm:px-8 lg:border-r">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-surface-card" />
          ))}
        </div>
        <div className="px-6 py-7">
          <div className="h-96 animate-pulse rounded-xl border border-border bg-surface-card" />
        </div>
      </div>
    </div>
  );
}

export function SignalDetailError({ message }: { message: string | null }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-critical-border bg-critical-bg p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-critical" />
        <p className="mb-1 font-display text-lg font-semibold text-primary">
          {message ?? "Sinal não encontrado"}
        </p>
        <p className="mb-4 text-sm text-critical">O sinal solicitado não pôde ser carregado.</p>
        <Link href="/radar" className="text-xs text-brand-text hover:underline">
          Voltar ao radar
        </Link>
      </div>
    </div>
  );
}
