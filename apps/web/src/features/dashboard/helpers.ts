import type { SignalSeverity, RadarV2SignalItem, RadarV2CaseItem } from "@/lib/types";

/** Severity → CSS token (fill color for glyphs, bars, ticks). */
export const SEVERITY_VAR: Record<SignalSeverity, string> = {
  low: "var(--color-low)",
  medium: "var(--color-medium)",
  high: "var(--color-high)",
  critical: "var(--color-critical)",
};

const SEVERITY_RANK: Record<SignalSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/** One day of the fita-radar seismograph: count of signals + that day's peak. */
export interface SeismographTick {
  /** ISO date (yyyy-mm-dd) of the bucket. */
  date: string;
  count: number;
  /** Peak severity observed that day, or null when the day is empty. */
  peak: SignalSeverity | null;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Bucket a flat list of signals into the last `days` daily ticks, deriving each
 * day's peak severity. Real data, aggregated client-side — there is no
 * daily-timeseries endpoint (see report). Days with no sampled signal render as
 * empty baseline ticks.
 */
export function buildSeismograph(signals: RadarV2SignalItem[], days: number): SeismographTick[] {
  const buckets = new Map<string, { count: number; rank: number }>();
  for (const s of signals) {
    if (!s.created_at) continue;
    const key = localDateKey(new Date(s.created_at));
    const prev = buckets.get(key) ?? { count: 0, rank: 0 };
    buckets.set(key, {
      count: prev.count + 1,
      rank: Math.max(prev.rank, SEVERITY_RANK[s.severity] ?? 0),
    });
  }

  const rankToSeverity = (rank: number): SignalSeverity | null =>
    rank === 4 ? "critical" : rank === 3 ? "high" : rank === 2 ? "medium" : rank === 1 ? "low" : null;

  const ticks: SeismographTick[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d);
    const b = buckets.get(key);
    ticks.push({
      date: key,
      count: b?.count ?? 0,
      peak: b ? rankToSeverity(b.rank) : null,
    });
  }
  return ticks;
}

/** Signals emerged within the last `days` — derived from the sampled seismograph. */
export function countRecent(ticks: SeismographTick[], days: number): number {
  return ticks.slice(-days).reduce((sum, t) => sum + t.count, 0);
}

/**
 * Triage ordering for the worklist: severity first, freshest first within a
 * band. Answers "what do I need to look at now?" — the home's own thesis.
 */
export function triageCases(cases: RadarV2CaseItem[]): RadarV2CaseItem[] {
  return [...cases].sort((a, b) => {
    const sev = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
    if (sev !== 0) return sev;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export type WorklistTag = "novo" | "atualizado" | null;

/**
 * Novelty tag from created_at only (the sole timestamp the API exposes).
 * "SUBIU" (severity escalation) needs state history the backend doesn't yet
 * provide — omitted rather than faked (see report).
 */
export function noveltyTag(createdAt: string): WorklistTag {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  if (ageDays <= 2) return "novo";
  if (ageDays <= 9) return "atualizado";
  return null;
}
