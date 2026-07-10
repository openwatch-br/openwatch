import { Suspense } from "react";
import ClientPage from "@/features/coverage/components/CoverageRunDetailPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="ow-mode-working ow-content">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
