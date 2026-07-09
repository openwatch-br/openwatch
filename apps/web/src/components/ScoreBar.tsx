import { clsx } from "clsx";
import type { SignalSeverity } from "@/lib/types";

/**
 * ScoreBar — solid single-severity fill with threshold ticks (40 · 70 · 90)
 * and a mono numeric value, so the level reads without depending on hue. The
 * fill color keys off the 4 severity tokens: derived from `value` unless an
 * explicit `severity` is given.
 */
interface ScoreBarProps {
  label: string;
  value: number; // 0–100
  /** Explicit severity; when omitted it is derived from `value` thresholds. */
  severity?: SignalSeverity;
  /** @deprecated legacy tone prop — ignored; fill now derives from severity/value. */
  color?: "accent" | "warning" | "error";
}

function severityFromValue(value: number): SignalSeverity {
  if (value >= 90) return "critical";
  if (value >= 70) return "high";
  if (value >= 40) return "medium";
  return "low";
}

const THRESHOLDS: ReadonlyArray<number> = [40, 70, 90];

export function ScoreBar({ label, value, severity }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const sev = severity ?? severityFromValue(clamped);
  return (
    <div className="flex flex-col">
      <div className="ow-scorebar-head">
        <span className="ow-scorebar-label">{label}</span>
        <span className={clsx("ow-scorebar-value", `ow-sev-text-${sev}`)}>{clamped} / 100</span>
      </div>
      <div className="ow-scorebar-track">
        <div
          className={clsx("ow-scorebar-fill", `ow-sev-fill-${sev}`)}
          style={{ width: `${clamped}%` }}
        />
        {THRESHOLDS.map((t) => (
          <div key={t} className="ow-scorebar-tick" style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="ow-scorebar-scale">
        <span>0</span>
        <span>baixo 40</span>
        <span>alto 70</span>
        <span>crít. 90</span>
      </div>
    </div>
  );
}
