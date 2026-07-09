"use client";

import { SinalFinancialFlow } from "../SinalFinancialFlow";
import { deriveFlow } from "./inference";
import { formatBRL } from "@/lib/utils";
import type { SignalDetail } from "@/lib/types";

/**
 * "O achado" — the forensic opening: full narrative, the origin→destination
 * money-flow diagram (reusing SinalFinancialFlow), and the threshold-crossing
 * stats drawn from investigation_summary.
 */
export function SignalFinding({ signal }: { signal: SignalDetail }) {
  const paragraphs = signal.explanation_md
    ? signal.explanation_md.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : signal.summary
      ? [signal.summary]
      : [];

  const flow = deriveFlow(signal);
  const inv = signal.investigation_summary;
  const stats = inv
    ? [
        inv.observed_total_brl != null
          ? { value: formatBRL(inv.observed_total_brl), label: "total observado", strong: true }
          : null,
        inv.legal_threshold_brl != null
          ? { value: formatBRL(inv.legal_threshold_brl), label: "limite legal", strong: false }
          : null,
        inv.ratio_over_threshold != null
          ? { value: `${inv.ratio_over_threshold.toFixed(2)}×`, label: "sobre o limite", strong: true }
          : null,
      ].filter((s): s is { value: string; label: string; strong: boolean } => s !== null)
    : [];

  if (paragraphs.length === 0 && !flow && stats.length === 0) return null;

  return (
    <section>
      {paragraphs.length > 0 && (
        <>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            O achado
          </p>
          <div className="flex flex-col gap-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-[1.7] text-secondary">
                {p}
              </p>
            ))}
          </div>
        </>
      )}

      {flow && (
        <div className="mt-5">
          <SinalFinancialFlow
            source={flow.source}
            target={flow.target}
            amountLabel={flow.amountLabel}
          />
        </div>
      )}

      {stats.length > 0 && (
        <div className="mt-3 flex gap-4 rounded-lg border border-border-subtle bg-surface-subtle px-6 py-4">
          {stats.map((s) => (
            <div key={s.label} className="flex-1">
              <div
                className="font-mono text-[15px]"
                style={{ color: s.strong ? "var(--color-brand-text)" : "var(--color-primary)" }}
              >
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {inv?.what_crossed && inv.what_crossed.length > 0 && (
        <div className="mt-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Limiares cruzados
          </p>
          <ul className="flex flex-col gap-1.5">
            {inv.what_crossed.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-[1.55] text-secondary">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
