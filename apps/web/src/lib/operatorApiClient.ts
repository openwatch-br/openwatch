/**
 * operatorApiClient.ts
 *
 * Client for operator pipeline actions. Calls same-origin Next.js Route
 * Handlers under /api/internal/* (see src/app/api/internal/**\/route.ts),
 * which proxy to the gateway's /internal/* endpoints and attach the
 * server-only INTERNAL_API_KEY. The browser never sees that key.
 *
 * IMPORTANT: Only import this file in operator/admin pages or components.
 */

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function postJSON<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "POST" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PipelineDispatchResponse {
  status: "dispatched";
  pipeline_id: string;
  stages: string[];
}

export interface PipelineStatusResponse {
  is_running: boolean;
  stages: {
    ingest: "running" | "idle";
    entity_resolution: "running" | "idle";
    signals: "running" | "idle";
  };
}

export interface PipelineCapacity {
  running_ingest_jobs: number;
  max_concurrent_ingest: number;
  er_running: boolean;
  slots_available: number;
  can_dispatch: {
    ingest: boolean;
    entity_resolution: boolean;
    baselines: boolean;
    signals: boolean;
  };
  recommendation: "idle" | "ingest_active" | "er_active";
}

export interface DispatchNextResponse {
  status: "dispatched" | "blocked" | "nothing_pending";
  reason?: string;
  dispatched: { connector: string; job: string; task_id: string } | null;
  slots_remaining?: number;
}

// ── Operator functions ────────────────────────────────────────────────────────

export function getPipelineStatus(): Promise<PipelineStatusResponse> {
  return fetchJSON("/api/internal/pipeline/status");
}

export function triggerFullPipeline(): Promise<PipelineDispatchResponse> {
  return postJSON("/api/internal/pipeline/full");
}

export function requestYieldConnector(
  connector: string,
): Promise<{ status: string; jobs_signaled: number }> {
  return postJSON(`/api/internal/ingest/${encodeURIComponent(connector)}/yield`);
}

export function getPipelineCapacity(): Promise<PipelineCapacity> {
  return fetchJSON("/api/internal/pipeline/capacity");
}

export function dispatchNextPending(): Promise<DispatchNextResponse> {
  return postJSON("/api/internal/pipeline/dispatch-next");
}
