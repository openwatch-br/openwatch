import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/EntityNetworkPage";

export function generateStaticParams() {
  return [{ entityId: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  // Full-bleed canvas — EntityNetworkPage owns the layout (floating islands
  // over the graph), so we skip the ow-content width/padding constraints.
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
