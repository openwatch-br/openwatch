import type { ReactNode } from "react";
import type { InferenceField } from "../InferencePanel";
import type { FlowNode } from "../SinalFinancialFlow";
import type { SignalDetail, TypologyLegalBasis } from "@/lib/types";
import { formatBRL } from "@/lib/utils";

/**
 * Forensic derivations for the legacy standalone signal page (`/signal/[id]`).
 * Mirrors the "laudo forense" reasoning of SinalPage but sourced from the
 * richer `SignalDetail` shape (investigation_summary, factors, legal basis).
 */

const ENTITY_TOKEN: Record<string, string> = {
  org: "var(--color-entity-org)",
  company: "var(--color-entity-company)",
  person: "var(--color-entity-person)",
};

const DISCLAIMER: ReactNode =
  "Não afirma dolo, fraude ou culpa. O registro pode estar suspenso por decisão não refletida na base, ou tratar-se de homônimo cadastral. É um indício que requer apuração — não uma condenação.";

/** First narrative paragraph — summary wins, else the head of explanation_md. */
export function leadNarrative(signal: SignalDetail): string | null {
  if (signal.summary) return signal.summary;
  if (signal.explanation_md) {
    const first = signal.explanation_md.split(/\n\n+/)[0];
    return first ? first.trim() : null;
  }
  return null;
}

/** Legal references shown as support in inference field 2. */
export function legalRefs(
  signal: SignalDetail,
  legalBasis: TypologyLegalBasis | null,
): string[] {
  const refs: string[] = [];
  if (legalBasis) {
    for (const art of legalBasis.law_articles) {
      refs.push(art.article ? `${art.law_name} art. ${art.article}` : art.law_name);
    }
  }
  const legalRef = signal.investigation_summary?.legal_reference;
  if (legalRef) refs.push(legalRef);
  return refs.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);
}

export function inferenceScore(signal: SignalDetail): number {
  return Math.round(signal.confidence * 100);
}

export function buildInferenceFields(
  signal: SignalDetail,
  legalBasis: TypologyLegalBasis | null,
): InferenceField[] {
  const lead = leadNarrative(signal);
  const refs = legalRefs(signal, legalBasis);
  const factorText =
    signal.factor_descriptions && Object.keys(signal.factor_descriptions).length > 0
      ? Object.values(signal.factor_descriptions)
          .map((f) => f.label)
          .join(", ")
      : null;

  return [
    {
      label: "O que os dados mostram",
      tone: "data",
      body:
        lead ??
        (factorText
          ? `Fatores detectados a partir de bases oficiais: ${factorText}.`
          : "Correlação detectada entre eventos oficiais concordantes."),
    },
    {
      label: "O que isto pode indicar",
      tone: "indicate",
      body:
        refs.length > 0
          ? "Possível violação das normas referenciadas. Referência normativa exibida como apoio à apuração, não como enquadramento."
          : "Padrão que, à luz dos dados, merece apuração formal pelos órgãos de controle competentes.",
      ...(refs.length > 0 ? { refs } : {}),
    },
    {
      label: "O que isto NÃO afirma",
      tone: "negate",
      body: DISCLAIMER,
    },
  ];
}

export interface DerivedFlow {
  source: FlowNode;
  target: FlowNode;
  amountLabel: string;
  contractLabel?: string;
}

/** Origin → destination money flow, built from involved entities + totals. */
export function deriveFlow(signal: SignalDetail): DerivedFlow | null {
  const entities = signal.entities ?? [];
  const total = signal.investigation_summary?.observed_total_brl ?? null;
  if (total == null || total <= 0) return null;

  const payer = entities.find((e) => e.type === "org");
  const recipient = entities.find((e) => e.type === "company");
  if (!payer || !recipient) return null;

  return {
    source: { name: payer.name, role: "órgão pagador", token: ENTITY_TOKEN.org! },
    target: { name: recipient.name, role: "beneficiário", token: ENTITY_TOKEN.company! },
    amountLabel: formatBRL(total),
  };
}

export { ENTITY_TOKEN };
