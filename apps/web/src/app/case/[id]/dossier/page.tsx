import { Suspense } from "react";
import CaseDossierPage from "@/features/investigation/components/CaseDossierPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // During static export prerender the placeholder ID has no real data
  if (id === "placeholder") return null;
  return (
    <div className="ow-mode-editorial ow-content">
      <Suspense><CaseDossierPage id={id} /></Suspense>
    </div>
  );
}
