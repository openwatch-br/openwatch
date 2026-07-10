import { forwardJSON, proxyInternalPost } from "@/lib/server/internalGateway";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ connector: string }> },
) {
  const { connector } = await params;
  return forwardJSON(
    await proxyInternalPost(`/ingest/${encodeURIComponent(connector)}/yield`),
  );
}
