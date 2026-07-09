import { clsx } from "clsx";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, number> = {
  sm: 24,
  md: 28,
  lg: 36,
};

interface OpenWatchLogoMarkProps {
  size?: LogoSize;
  className?: string;
  /**
   * Render variant. "default" is for use on plain page/surface backgrounds
   * (hollow nodes stroke in --color-text, edges in --color-border-strong).
   * "inverse" is for placement on a solid --color-brand-filled surface —
   * hollow nodes and edges switch to --color-brand-ink for contrast. Note:
   * unlike the previous aperture mark, no background box is painted by
   * this component — every Nexo lockup reference renders the mark directly
   * on the surrounding surface, never in a filled chip.
   */
  variant?: "default" | "inverse";
}

/**
 * Nexo mark — a minimal 3-node / 2-edge ego-graph. One filled node (the
 * entity under analysis) connects to two hollow nodes (connections under
 * scrutiny). Affirms the product's method — linking points with evidence —
 * never a verdict. Geometry is fixed per Fundação's construction rules:
 * do not rotate, do not fill the hollow nodes, no semantic (severity/status)
 * colors, no photography backgrounds.
 */
export function OpenWatchLogoMark({
  size = "md",
  className,
  variant = "default",
}: OpenWatchLogoMarkProps) {
  const px = sizeMap[size];
  const nodeFill = "var(--color-brand)";
  const hollowStroke = variant === "inverse" ? "var(--color-brand-ink)" : "var(--color-text)";
  const edgeStroke = variant === "inverse" ? "var(--color-brand-ink)" : "var(--color-border-strong)";

  return (
    <span
      className={clsx("inline-flex items-center justify-center", className)}
      style={{ width: px, height: (px * 40) / 42 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 42 40"
        width={px}
        height={(px * 40) / 42}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Edges */}
        <line x1="12" y1="28" x2="21" y2="10" stroke={edgeStroke} strokeWidth="2.5" />
        <line x1="21" y1="10" x2="32" y2="26" stroke={edgeStroke} strokeWidth="2.5" />
        {/* Entity under analysis — filled */}
        <circle cx="21" cy="10" r="6" fill={nodeFill} />
        {/* Connections under scrutiny — hollow */}
        <circle cx="12" cy="28" r="5" stroke={hollowStroke} strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="26" r="5" stroke={hollowStroke} strokeWidth="2.5" fill="none" />
      </svg>
    </span>
  );
}

interface OpenWatchLogoProps {
  size?: LogoSize;
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "inverse";
}

export function OpenWatchLogo({
  size = "md",
  className,
  showWordmark = true,
  variant = "default",
}: OpenWatchLogoProps) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <OpenWatchLogoMark size={size} variant={variant} />
      {showWordmark && <span className="ow-sidebar-wordmark">OpenWatch</span>}
    </span>
  );
}
