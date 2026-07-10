import type { CoverageStatus } from "@/lib/types";

/** Shared status → visual mapping, used by the health strip, freshness map,
 * source detail modal and failed-run panel alike. */
export const STATUS_CFG: Record<CoverageStatus, {
  label: string;
  dotColor: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  badge: string;
}> = {
  ok:      { label: "OK",       dotColor: "var(--color-status-ok)",      textColor: "var(--color-low-text)",      borderColor: "var(--color-low-border)",      bgColor: "var(--color-low-bg)",      badge: "ow-badge ow-badge-low"      },
  warning: { label: "Atenção",  dotColor: "var(--color-status-warning)", textColor: "var(--color-medium-text)",   borderColor: "var(--color-medium-border)",   bgColor: "var(--color-medium-bg)",   badge: "ow-badge ow-badge-medium"   },
  stale:   { label: "Defasado", dotColor: "var(--color-status-stale)",   textColor: "var(--color-high-text)",     borderColor: "var(--color-high-border)",     bgColor: "var(--color-high-bg)",     badge: "ow-badge ow-badge-high"     },
  error:   { label: "Erro",     dotColor: "var(--color-status-error)",   textColor: "var(--color-critical-text)", borderColor: "var(--color-critical-border)", bgColor: "var(--color-critical-bg)", badge: "ow-badge ow-badge-critical"  },
  pending: { label: "Pendente", dotColor: "var(--color-status-pending)", textColor: "var(--color-text-3)",        borderColor: "var(--color-border)",          bgColor: "transparent",              badge: "ow-badge ow-badge-neutral"  },
};

export const RUN_STATUS_CFG: Record<string, { dotColor: string; textColor: string; label: string }> = {
  completed: { dotColor: "var(--color-low)",     textColor: "var(--color-low-text)",      label: "Concluído"  },
  running:   { dotColor: "var(--color-amber)",   textColor: "var(--color-amber-text)",    label: "Executando" },
  error:     { dotColor: "var(--color-critical)",textColor: "var(--color-critical-text)", label: "Erro"       },
  failed:    { dotColor: "var(--color-critical)",textColor: "var(--color-critical-text)", label: "Falhou"     },
  yielded:   { dotColor: "var(--color-medium)",  textColor: "var(--color-medium-text)",   label: "Cedeu vez"  },
  stuck:     { dotColor: "var(--color-high)",    textColor: "var(--color-high-text)",     label: "Travado"    },
  skipped:   { dotColor: "var(--color-text-3)",  textColor: "var(--color-text-3)",        label: "Ignorado"   },
  pending:   { dotColor: "var(--color-text-3)",  textColor: "var(--color-text-3)",        label: "Pendente"   },
};

/** Order used whenever sources need to surface the most urgent ones first. */
const URGENCY_ORDER: CoverageStatus[] = ["error", "stale", "warning", "pending", "ok"];
export function statusUrgency(status: CoverageStatus): number {
  const i = URGENCY_ORDER.indexOf(status);
  return i === -1 ? URGENCY_ORDER.length : i;
}

export function formatLag(hours: number | null | undefined): string {
  if (hours == null) return "—";
  if (hours < 1) return "<1h";
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 24 * 30) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 24 / 30)}m`;
}

export function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatDuration(start: string | null | undefined, end: string | null | undefined): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function lagColor(hours: number | null | undefined): string {
  if (hours == null) return "var(--color-text-3)";
  if (hours > 48) return "var(--color-critical-text)";
  if (hours > 24) return "var(--color-high-text)";
  return "var(--color-low-text)";
}
