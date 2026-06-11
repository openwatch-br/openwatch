import { Suspense } from "react";
import ClientPage from "@/features/investigation/components/EntityDetailPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="ow-mode-editorial ow-content">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
