"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// The signal laudo now lives inline on the dossiê (as an achado accordion).
// Old /sinal/[signalId] links redirect to the matching accordion.
export default function Page() {
  const { caseId, signalId } = useParams<{ caseId: string; signalId: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/radar/dossie/${caseId}#sig-${signalId}`);
  }, [caseId, signalId, router]);
  return null;
}
