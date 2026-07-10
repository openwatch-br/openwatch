/** Shared JSON/text formatting helpers for the run-detail field profile and sample viewers. */

export function stringifyJson(value: unknown): string {
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

export function formatStructuredValue(value: unknown): string {
  if (typeof value === "string") {
    const t = value.trim();
    if (t.startsWith("{") || t.startsWith("[")) {
      try { return JSON.stringify(JSON.parse(t), null, 2); } catch { return value; }
    }
    return value;
  }
  return stringifyJson(value);
}

export function shouldRenderAsBlock(v: unknown): boolean {
  if (typeof v !== "string") return true;
  const t = v.trim();
  return t.startsWith("{") || t.startsWith("[") || t.includes("\n");
}

export function coverageColor(p: number): string {
  if (p >= 90) return "var(--color-status-ok)";
  if (p >= 50) return "var(--color-status-warning)";
  return "var(--color-status-error)";
}
