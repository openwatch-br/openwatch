import type { CoverageV2LatestRun } from "@/lib/types";

export type FreshnessCellStatus = "ok" | "empty" | "failed";

export interface FreshnessCell {
  status: FreshnessCellStatus;
  title: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ms: number): number {
  return Math.floor(ms / DAY_MS) * DAY_MS;
}

/**
 * Derives a day-bucketed freshness strip from a connector's real run history.
 *
 * Backend gap: there is no dedicated day-bucketed freshness-history endpoint
 * (`/coverage/v2/source/{connector}/preview` only returns a flat list of the
 * most recent runs, `recent_runs`, newest first). This buckets those REAL
 * runs into calendar-day slots for the requested window instead of
 * fabricating data: a day with no returned run renders as "no data" (an
 * honest gap — matches the product's own "ausência de sinal ≠ regularidade"
 * framing), a day whose most recent run errored/got stuck renders as
 * "failed", otherwise "ok". Accuracy depends on the caller requesting enough
 * `runs_limit` to cover the window for that connector's cadence (see
 * `useSourceRunHistory`, which requests 120 — the backend's own internal
 * floor for this query, so no extra query cost).
 */
export function buildFreshnessCells(runs: CoverageV2LatestRun[], days: number): FreshnessCell[] {
  const todayStart = startOfDay(Date.now());
  const byOffset = new Map<number, FreshnessCellStatus>();

  for (const run of runs) {
    const at = run.started_at ?? run.finished_at;
    if (!at) continue;
    const runStart = startOfDay(new Date(at).getTime());
    const offset = Math.round((todayStart - runStart) / DAY_MS);
    if (offset < 0 || offset >= days) continue;
    // recent_runs is newest-first: the first run seen for a day is that
    // day's final state, so skip if already assigned.
    if (byOffset.has(offset)) continue;
    const failed = run.status === "error" || run.status === "failed" || run.is_stuck;
    byOffset.set(offset, failed ? "failed" : "ok");
  }

  const cells: FreshnessCell[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(todayStart - offset * DAY_MS);
    const label = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    const status = byOffset.get(offset) ?? "empty";
    const statusLabel = status === "ok" ? "ingeriu" : status === "failed" ? "falha" : "sem dado";
    cells.push({ status, title: `${label} · ${statusLabel}` });
  }
  return cells;
}

export function freshnessDateRangeLabel(days: number): { from: string; to: string } {
  const todayStart = startOfDay(Date.now());
  const from = new Date(todayStart - (days - 1) * DAY_MS);
  const to = new Date(todayStart);
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return { from: fmt(from), to: `hoje · ${fmt(to)}` };
}
