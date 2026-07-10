import { ConfidenceBadge } from "@/components/ConfidenceBadge";

const BANDS: { score: number; range: string }[] = [
  { score: 55, range: "score < 60" },
  { score: 70, range: "60 – 79" },
  { score: 87, range: "80 – 94" },
  { score: 97, range: "≥ 95" },
];

/**
 * Renders the four real confidence bands using the actual live
 * `ConfidenceBadge` component (dashed → hollow → half-filled → filled ring,
 * per its own docstring) instead of hand-drawing static pill illustrations —
 * what the reader sees here is exactly what appears on a signal.
 */
export function ConfidenceThresholdTable() {
  return (
    <div className="flex flex-col gap-2.5">
      {BANDS.map((b) => (
        <div key={b.range} className="flex items-center gap-3">
          <span className="w-[132px] shrink-0">
            <ConfidenceBadge score={b.score} />
          </span>
          <span className="text-mono-sm" style={{ color: "var(--color-text-2)" }}>
            {b.range}
          </span>
        </div>
      ))}
    </div>
  );
}
