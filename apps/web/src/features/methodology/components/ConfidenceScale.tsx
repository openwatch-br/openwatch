/**
 * The 0–100 confidence axis as a single labelled visual — four proportional
 * bands (heurística / correlacionada / corroborada / confirmada) rendered as
 * a gradient-filled track with threshold ticks at 60 / 80 / 95, instead of a
 * bullet list of ranges. Pairs with `ConfidenceThresholdTable` directly
 * below it, which shows the same four bands as the literal `ConfidenceBadge`
 * component used on a signal — this component gives the reader the shape of
 * the scale; the table below ties it back to what they'll actually see.
 */

interface Band {
  from: number;
  to: number;
  fill: string;
  opacity?: number;
  dashed?: boolean;
}

const BANDS: Band[] = [
  { from: 0, to: 60, fill: "var(--color-conf-heuristic)", dashed: true },
  { from: 60, to: 80, fill: "var(--color-conf-partial)" },
  { from: 80, to: 95, fill: "var(--color-conf-high)", opacity: 0.55 },
  { from: 95, to: 100, fill: "var(--color-conf-high)" },
];

const TICKS = [0, 60, 80, 95, 100];

export function ConfidenceScale() {
  return (
    <div className="my-6">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full border"
        style={{ borderColor: "var(--color-border)" }}
      >
        {BANDS.map((b) => (
          <div
            key={`${b.from}-${b.to}`}
            style={{
              width: `${b.to - b.from}%`,
              background: b.dashed
                ? `repeating-linear-gradient(125deg, ${b.fill}, ${b.fill} 3px, transparent 3px, transparent 7px)`
                : b.fill,
              opacity: b.opacity ?? 1,
            }}
          />
        ))}
      </div>
      <div className="text-mono-xs relative mt-1.5 h-4" style={{ color: "var(--color-text-3)" }}>
        {TICKS.map((t) => (
          <span
            key={t}
            className="absolute"
            style={{
              left: `${t}%`,
              transform: t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
