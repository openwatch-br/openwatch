import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/EntityNetworkPage";

export function generateStaticParams() {
  return [{ entityId: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="ow-mode-editorial ow-content">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
