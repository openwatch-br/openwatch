import { Suspense } from "react";
import ClientPage from "@/components/pages/SignalDetailPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return (
    <div className="ow-mode-working">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
