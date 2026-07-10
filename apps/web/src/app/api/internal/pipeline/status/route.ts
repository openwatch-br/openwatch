import { forwardJSON, proxyInternalGet } from "@/lib/server/internalGateway";

export async function GET() {
  return forwardJSON(await proxyInternalGet("/pipeline/status"));
}
