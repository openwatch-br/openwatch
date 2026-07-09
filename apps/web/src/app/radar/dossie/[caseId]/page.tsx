import { Suspense } from "react";
import ClientPage from "@/features/dossie/components/CaseDossierPage";

export function generateStaticParams() {
  return [{ caseId: "placeholder" }];
}

export default function Page(_: { params: Promise<Record<string, string>> }) {
  return (
    <div className="ow-mode-editorial w-full">
      <Suspense><ClientPage /></Suspense>
    </div>
  );
}
