import { Suspense } from "react";
import ClientPage from "@/components/pages/EntityDetailPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="ow-mode-working">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
