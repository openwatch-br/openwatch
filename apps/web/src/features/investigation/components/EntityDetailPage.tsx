"use client";

// Perfil de entidade (Nexo) — o ego-graph é a peça central. Trilho de
// identidade compacto à esquerda; grafo + sinais vinculados à direita.
// A composição vive em sub-componentes (entity/*) para evitar god-file.

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getEntity, getGraphNeighborhood, getRadarV2Signals } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { DetailSkeleton } from "@/components/Skeleton";
import type { EntityDetail, NeighborhoodResponse, RadarV2SignalItem } from "@/lib/types";
import { EntityIdentityRail } from "./entity/EntityIdentityRail";
import { EntityEgoSection } from "./entity/EntityEgoSection";
import { EntitySignalsList } from "./entity/EntitySignalsList";

export default function EntityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [neighborhood, setNeighborhood] = useState<NeighborhoodResponse | null>(null);
  const [signals, setSignals] = useState<RadarV2SignalItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const e = await getEntity(id);
        if (cancelled) return;
        setEntity(e);
        const [sigs, nbh] = await Promise.allSettled([
          getRadarV2Signals({ orgao_id: e.id, limit: 20 }),
          getGraphNeighborhood(id),
        ]);
        if (cancelled) return;
        if (sigs.status === "fulfilled") setSignals(sigs.value.items);
        if (nbh.status === "fulfilled") setNeighborhood(nbh.value);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg.includes("404") ? "not_found" : msg);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <EmptyState
          title="Entidade não encontrada"
          description="A entidade solicitada não existe ou foi removida."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <EmptyState title="Erro ao carregar entidade" description={error} />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <DetailSkeleton />
      </div>
    );
  }

  const connectionCount = neighborhood?.co_participants?.length ?? 0;
  const stats = [
    { value: signals === null ? "…" : String(signals.length), label: "sinais vinculados" },
    { value: String(connectionCount), label: "conexões diretas" },
  ];

  return (
    <div className="animate-slide-up mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5" style={{ color: "var(--color-text-3)" }}>
        <Link href="/radar/rede" className="text-mono-xs transition-colors hover:text-[var(--color-brand-text)]">
          Rede
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-mono-xs max-w-xs truncate" style={{ color: "var(--color-text-2)" }}>
          {entity.name}
        </span>
      </nav>

      {/* Ego-graph centred profile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        <EntityIdentityRail entity={entity} stats={stats} />

        <div className="flex min-w-0 flex-col gap-6">
          <EntityEgoSection entityId={entity.id} />
          <EntitySignalsList signals={signals} />
        </div>
      </div>
    </div>
  );
}
