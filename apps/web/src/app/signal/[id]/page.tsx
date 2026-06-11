import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/SignalDetailPage";
import { IndicioDisclaimer } from "@/components/IndicioDisclaimer";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return (
    <div className="ow-mode-editorial ow-content">
      <Suspense><ClientPage /></Suspense>
      <div className="mx-auto max-w-4xl px-4 pb-6 pt-2">
        <IndicioDisclaimer />
      </div>
    </div>
  );
}
