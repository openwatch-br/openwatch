"use client";

import { useQueries } from "@tanstack/react-query";
import { getCoverageV2SourcePreview } from "@/lib/api";
import type { CoverageV2SourcePreviewResponse } from "@/lib/types";

// The backend's per-source-preview query already fetches a floor of 120 rows
// internally regardless of runs_limit (see coverage.py:
// `limit=max(120, runs_limit * 12)`), so requesting 120 here reuses that
// floor at no extra query cost while giving the freshness map a good chance
// of covering a full 30-day window for daily+ cadence connectors.
const RUNS_LIMIT = 120;

/**
 * Fetches each connector's recent-run history in parallel (one request per
 * source, same endpoint the old per-source diagnostic modal already used).
 * Real data — no synthetic history. See `freshnessCells.ts` for how this is
 * bucketed into the 30-day strip, including the documented backend gap.
 */
export function useSourceRunHistory(connectors: string[]) {
  const results = useQueries({
    queries: connectors.map((connector) => ({
      queryKey: ["coverage-source-history", connector],
      queryFn: () => getCoverageV2SourcePreview(connector, { runs_limit: RUNS_LIMIT }),
      staleTime: 60_000,
    })),
  });

  const byConnector = new Map<string, CoverageV2SourcePreviewResponse>();
  connectors.forEach((connector, i) => {
    const data = results[i]?.data;
    if (data) byConnector.set(connector, data);
  });

  const loading = results.length > 0 && results.every((r) => r.isLoading);

  return { byConnector, loading };
}
