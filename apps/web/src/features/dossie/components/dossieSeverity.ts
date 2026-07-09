import type { SignalSeverity } from "@/lib/types";

/** Severity → CSS custom-property color (matches globals.css severity tokens). */
export function severityColor(severity: string): string {
  const known: Record<string, string> = {
    critical: "var(--color-critical)",
    high: "var(--color-high)",
    medium: "var(--color-medium)",
    low: "var(--color-low)",
  };
  return known[severity] ?? "var(--color-text-3)";
}

export const SEVERITY_LABEL: Record<SignalSeverity, string> = {
  critical: "Severidade crítica",
  high: "Severidade alta",
  medium: "Severidade média",
  low: "Severidade baixa",
};
