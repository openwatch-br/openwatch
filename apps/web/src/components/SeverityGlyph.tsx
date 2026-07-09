import { clsx } from "clsx";
import type { SignalSeverity } from "@/lib/types";

/**
 * Severity glyph — 1–4 filled segments encoding the severity rank, so the
 * level reads without relying on color (colorblind-legible). Filled segments
 * inherit `currentColor`; empty segments use a neutral border. Used inside
 * SeverityBadge and standalone anywhere severity appears.
 */
const SEVERITY_RANK: Record<SignalSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

interface SeverityGlyphProps {
  severity: SignalSeverity;
  /** "sm" = ~9px segments for dense/table-inline use; "md" = ~10px default. */
  size?: "sm" | "md";
  className?: string;
}

export function SeverityGlyph({ severity, size = "md", className }: SeverityGlyphProps) {
  const filled = SEVERITY_RANK[severity];
  return (
    <span
      aria-hidden="true"
      className={clsx("ow-sev-glyph", size === "sm" && "ow-sev-glyph-sm", className)}
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={clsx("ow-sev-seg", i >= filled && "ow-sev-seg-empty")} />
      ))}
    </span>
  );
}
