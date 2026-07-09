import { clsx } from "clsx";
import { TYPOLOGY_LABELS } from "@/lib/constants";

/**
 * Case-type chip — Nexo: neutral, no semantic color. Uniform mono chip for
 * every type, formatted `T07 · REDE DE CARTEL` (short code + uppercased
 * label). When the code has no known label it still renders the raw code, so
 * an unmapped type is never silently dropped (only null/empty/OTHER hide).
 */
interface CaseTypeBadgeProps {
  caseType: string | null | undefined;
  className?: string;
}

export function CaseTypeBadge({ caseType, className }: CaseTypeBadgeProps) {
  if (!caseType || caseType === "OTHER") return null;

  const label = TYPOLOGY_LABELS[caseType];
  const text = label ? `${caseType} · ${label.toUpperCase()}` : caseType.toUpperCase();

  return <span className={clsx("ow-casetype", className)}>{text}</span>;
}
