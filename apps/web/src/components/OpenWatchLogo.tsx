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
   * Render variant. "default" uses --color-brand on a transparent ground.
   * "inverse" uses white on --color-brand (for dark surfaces).
   */
  variant?: "default" | "inverse";
}

/**
 * Aperture mark — concentric thin rings forming a camera-iris symbol.
 * Reads as "lens on power." Pure geometry, no decorative fill.
 */
export function OpenWatchLogoMark({
  size = "md",
  className,
  variant = "default",
}: OpenWatchLogoMarkProps) {
  const px = sizeMap[size];
  // .ow-brand-mark paints an amber ground — rings must use the inverse tone on it
  const stroke = variant === "inverse" ? "var(--color-brand)" : "var(--color-brand-text)";

  return (
    <span
      className={clsx("inline-flex items-center justify-center ow-brand-mark", className)}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        width={px}
        height={px}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="16" cy="16" r="13" stroke={stroke} strokeWidth="1.5" />
        {/* Mid ring */}
        <circle cx="16" cy="16" r="9" stroke={stroke} strokeWidth="1.5" opacity="0.65" />
        {/* Inner pupil — solid */}
        <circle cx="16" cy="16" r="3.2" fill={stroke} />
        {/* Aperture blades — three short tangent strokes (geometric, not literal) */}
        <path d="M16 3 L16 7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27.26 22.5 L23.79 20.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4.74 22.5 L8.21 20.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
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
