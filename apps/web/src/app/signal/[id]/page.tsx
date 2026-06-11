import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/SignalDetailPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return (
    <div className="ow-mode-editorial ow-content">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
