"use client";

// Perfil de órgão (Nexo) — trilho de identidade + distribuição de
// severidade.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";
import { getOrg } from "@/lib/api";
import { DetailSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import type { OrgSummary } from "@/lib/types";
import { OrgIdentityRail } from "./org/OrgIdentityRail";
import { OrgSeverityStrip } from "./org/OrgSeverityStrip";

export default function OrgDetailPage() {
  const params = useParams();
  const [org, setOrg] = useState<OrgSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      setError(null);
      getOrg(params.id as string)
        .then(setOrg)
        .catch(() => setError("Erro ao carregar organização"))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <EmptyState icon={AlertTriangle} title="Erro ao carregar organização" description={error} />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={Search}
          title="Organização não encontrada"
          description="A organização solicitada não existe ou foi removida"
        />
      </div>
    );
  }

  return (
    <div className="animate-slide-up mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5" style={{ color: "var(--color-text-3)" }}>
        <Link href="/radar" className="text-mono-xs transition-colors hover:text-[var(--color-brand-text)]">
          Radar
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-mono-xs max-w-xs truncate" style={{ color: "var(--color-text-2)" }}>
          {org.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        <OrgIdentityRail org={org} />

        <div className="flex min-w-0 flex-col gap-6">
          <OrgSeverityStrip
            distribution={org.severity_distribution}
            total={org.total_signals}
          />
        </div>
      </div>
    </div>
  );
}
