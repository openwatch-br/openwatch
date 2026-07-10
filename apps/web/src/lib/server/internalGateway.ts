/**
 * internalGateway.ts
 *
 * Server-only proxy to the gateway's /internal/* operator endpoints.
 * Attaches the server-only INTERNAL_API_KEY (via X-Internal-Api-Key), which
 * is never exposed to the browser.
 *
 * IMPORTANT: Import this only from Route Handlers (src/app/api/**\/route.ts).
 * Never import from a "use client" component or a NEXT_PUBLIC_* context —
 * INTERNAL_API_KEY must never reach the client bundle.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// Mirrors the gateway's Settings.INTERNAL_API_KEY dev default so local dev
// works out of the box; production must set INTERNAL_API_KEY explicitly.
const INTERNAL_API_KEY =
  process.env.INTERNAL_API_KEY ??
  (process.env.NODE_ENV !== "production"
    ? "dev-internal-key-change-in-production"
    : undefined);

function internalHeaders(): HeadersInit {
  if (!INTERNAL_API_KEY) {
    console.error(
      "INTERNAL_API_KEY is not set — /api/internal/* requests will be sent unauthenticated.",
    );
  }
  return { "X-Internal-Api-Key": INTERNAL_API_KEY ?? "" };
}

export function proxyInternalGet(path: string): Promise<Response> {
  return fetch(`${API_BASE}/internal${path}`, {
    headers: internalHeaders(),
    cache: "no-store",
  });
}

export function proxyInternalPost(path: string): Promise<Response> {
  return fetch(`${API_BASE}/internal${path}`, {
    method: "POST",
    headers: internalHeaders(),
    cache: "no-store",
  });
}

/** Forwards an upstream gateway response's body and status code as-is. */
export async function forwardJSON(upstream: Response): Promise<Response> {
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
