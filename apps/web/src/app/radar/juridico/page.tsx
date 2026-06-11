import { getRadarV2Summary } from "@/lib/api";
import type { RadarV2SummaryResponse } from "@/lib/types";
import { RadarBreadcrumb } from "@/features/radar/components/RadarBreadcrumb";
import { LegalSection } from "@/features/investigation/components/v2/LegalSection";

export default async function JuridicoPage() {
  let summary: RadarV2SummaryResponse | null = null;
  try {
    summary = await getRadarV2Summary();
  } catch {
    // render with empty data on error
  }

  return (
    <div className="ow-mode-editorial ow-content">
      <RadarBreadcrumb crumbs={[
        { label: "Radar", href: "/radar" },
        { label: "Juridico" },
      ]} />

      <div className="mt-6">
        <LegalSection typologyCounts={summary?.typology_counts ?? []} />
      </div>
    </div>
  );
}
