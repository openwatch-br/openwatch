import { clsx } from "clsx";

/**
 * Confidence pill — always-on progressive ring encoding the ER score band by
 * shape (dashed → hollow → half → filled), not color alone:
 *   < 60  heurística     (dashed ring)
 *   60–79 correlacionada (solid hollow ring)
 *   80–94 corroborada    (half-filled dot)
 *   ≥ 95  confirmada     (solid filled chip)
 * Score is the 0–100 ER cluster confidence. Null/undefined renders nothing
 * (identity confidence unknown). For the contextual "use with caution"
 * warning banner, see LowConfidenceAlert.
 */
interface ConfidenceBadgeProps {
  score: number | null | undefined;
  className?: string;
}

type ConfidenceBand = {
  className: string;
  label: string;
};

function bandFor(score: number): ConfidenceBand {
  if (score >= 95) return { className: "ow-conf-confirmed", label: "confirmada" };
  if (score >= 80) return { className: "ow-conf-corroborated", label: "corroborada" };
  if (score >= 60) return { className: "ow-conf-partial", label: "correlacionada" };
  return { className: "ow-conf-heuristic", label: "heurística" };
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  if (score == null) return null;
  const band = bandFor(score);
  return (
    <span className={clsx("ow-conf", band.className, className)}>
      <span className="ow-conf-dot" />
      {band.label}
    </span>
  );
}
