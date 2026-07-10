import { forwardJSON, proxyInternalPost } from "@/lib/server/internalGateway";

export async function POST() {
  return forwardJSON(await proxyInternalPost("/pipeline/full"));
}
