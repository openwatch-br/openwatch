import { clsx } from "clsx";
import type { ReactNode } from "react";
import type { SignalSeverity, CoverageStatus } from "@/lib/types";
import { SeverityGlyph } from "@/components/SeverityGlyph";

/* ── Severity Badge ─────────────────────────────────────────────────
   Nexo: glyph (1–4 segments) + subtle fill + label. Severity is never
   color-only — the segment glyph carries the level on its own. */
type SeverityBadgeProps = {
  severity: SignalSeverity;
  className?: string;
};

const severityBadgeClass: Record<SignalSeverity, string> = {
  critical: "ow-sev-badge-critical",
  high:     "ow-sev-badge-high",
  medium:   "ow-sev-badge-medium",
  low:      "ow-sev-badge-low",
};

const severityLabel: Record<SignalSeverity, string> = {
  critical: "Crítico",
  high:     "Alto",
  medium:   "Médio",
  low:      "Baixo",
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span className={clsx("ow-sev-badge", severityBadgeClass[severity], className)}>
      <SeverityGlyph severity={severity} />
      {severityLabel[severity]}
    </span>
  );
}

/* ── Status Badge ───────────────────────────────────────────────── */
type StatusBadgeProps = {
  status: CoverageStatus;
  className?: string;
};

const statusClass: Record<CoverageStatus, string> = {
  ok:      "ow-badge-low",
  warning: "ow-badge-medium",
  stale:   "ow-badge-high",
  error:   "ow-badge-critical",
  pending: "ow-badge-neutral",
};

const statusLabel: Record<CoverageStatus, string> = {
  ok:      "OK",
  warning: "Atenção",
  stale:   "Desatualizado",
  error:   "Erro",
  pending: "Pendente",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={clsx("ow-badge", statusClass[status], className)}>
      <span className={clsx("ow-status-dot", {
        "ow-status-ok":      status === "ok",
        "ow-status-warning": status === "warning",
        "ow-status-stale":   status === "stale",
        "ow-status-error":   status === "error",
        "ow-status-pending": status === "pending",
      })} />
      {statusLabel[status]}
    </span>
  );
}

/* ── Generic Badge ──────────────────────────────────────────────── */
type BadgeVariant = "critical" | "high" | "medium" | "low" | "info" | "neutral" | "amber" | "trust" | "signal";

interface BadgeProps {
  variant?: BadgeVariant;
  /** @deprecated Use SeverityBadge instead */
  severity?: SignalSeverity;
  /** @deprecated dot is no-op; use SeverityBadge */
  dot?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Badge({ variant, severity, children, className }: BadgeProps) {
  if (severity) {
    return <SeverityBadge severity={severity} className={className} />;
  }
  return (
    <span className={clsx("ow-badge", `ow-badge-${variant ?? "neutral"}`, className)}>
      {children}
    </span>
  );
}

/* ── Entity Type Badge ──────────────────────────────────────────── */
type EntityType = "person" | "company" | "org" | "unknown";

const entityLabel: Record<EntityType, string> = {
  person:  "Pessoa",
  company: "Empresa",
  org:     "Organização",
  unknown: "Desconhecido",
};

const entityColor: Record<EntityType, string> = {
  person:  "var(--color-entity-person)",
  company: "var(--color-entity-company)",
  org:     "var(--color-entity-org)",
  unknown: "var(--color-entity-unknown)",
};

interface EntityTypeBadgeProps {
  type: EntityType;
  className?: string;
}

export function EntityTypeBadge({ type, className }: EntityTypeBadgeProps) {
  return (
    <span
      className={clsx("ow-badge", className)}
      style={{
        background: `${entityColor[type]}18`,
        color: entityColor[type],
        borderColor: `${entityColor[type]}40`,
      }}
    >
      {entityLabel[type]}
    </span>
  );
}
