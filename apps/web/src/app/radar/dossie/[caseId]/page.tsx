import { Suspense } from "react";
import ClientPage from "@/features/radar/components/RadarDossierPage";

export function generateStaticParams() {
  return [{ caseId: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="ow-mode-editorial ow-content">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
