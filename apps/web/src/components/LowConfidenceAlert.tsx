import { AlertTriangle, AlertCircle } from "lucide-react";

/**
 * Contextual "use with caution" banner for low ER cluster confidence. Distinct
 * from the ConfidenceBadge pill: this is the fuller inline alert shown next to
 * data that shouldn't be cited without checking the source.
 *   score ≥ 80 or null: no banner (sufficient confidence / unmerged entity)
 *   60–79: partial-confidence warning
 *   < 60:  insufficient-confidence warning
 */
interface LowConfidenceAlertProps {
  score: number | null | undefined;
}

export function LowConfidenceAlert({ score }: LowConfidenceAlertProps) {
  if (score == null || score >= 80) return null;

  if (score >= 60) {
    return (
      <span className="ow-alert ow-alert-warning inline-flex items-start gap-2 !py-2 font-mono text-[12.5px]">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Identidade com confiança parcial (score 60–79) — verifique os dados de origem antes de citar.
      </span>
    );
  }

  return (
    <span className="ow-alert ow-alert-error inline-flex items-start gap-2 !py-2 font-mono text-[12.5px]">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      Confiança insuficiente (score &lt; 60) — dado disponível para análise, não para afirmação.
    </span>
  );
}
