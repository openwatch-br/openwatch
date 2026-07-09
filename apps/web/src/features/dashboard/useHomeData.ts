"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRadarV2Summary,
  getRadarV2Cases,
  getRadarV2Signals,
  getRadarV2CaseBatchPreview,
  getCoverageV2Sources,
} from "@/lib/api";
import type { SignalSeverity } from "@/lib/types";
import { triageCases, noveltyTag, type WorklistTag } from "./helpers";

const SEISMO_DAYS = 30;
const SEISMO_SAMPLE = 600;
const WORKLIST_SIZE = 5;

export interface WorklistItem {
  id: string;
  rank: number;
  severity: SignalSeverity;
  code: string | null;
  title: string;
  tag: WorklistTag;
  why: string | null;
  org: string | null;
  value: number | null;
  confidence: number | null;
}

async function loadWorklist(): Promise<WorklistItem[]> {
  const { items } = await getRadarV2Cases({ limit: 12 });
  const top = triageCases(items).slice(0, WORKLIST_SIZE);
  const previews = await getRadarV2CaseBatchPreview(top.map((c) => c.id));

  return top.map((c, i) => {
    const preview = previews[c.id];
    const confidences = (preview?.top_signals ?? [])
      .map((s) => s.confidence)
      .filter((n): n is number => typeof n === "number");
    const org = preview?.case.entity_names?.[0] ?? null;
    return {
      id: c.id,
      rank: i + 1,
      severity: c.severity,
      code: c.typology_codes?.[0] ?? null,
      title: c.title,
      tag: noveltyTag(c.created_at),
      why: c.summary ?? null,
      org: org ?? (c.entity_count > 0 ? `${c.entity_count} entidades` : null),
      value: preview?.case.total_value_brl ?? null,
      confidence: confidences.length ? Math.max(...confidences) : null,
    };
  });
}

export function useHomeData() {
  const summary = useQuery({
    queryKey: ["home", "summary"],
    queryFn: () => getRadarV2Summary(),
  });

  const seismoSignals = useQuery({
    queryKey: ["home", "seismograph"],
    queryFn: () => getRadarV2Signals({ sort: "ingestion_date", limit: SEISMO_SAMPLE }),
  });

  const worklist = useQuery({
    queryKey: ["home", "worklist"],
    queryFn: loadWorklist,
  });

  const sources = useQuery({
    queryKey: ["home", "sources"],
    queryFn: () => getCoverageV2Sources({ limit: 8, sort: "status_desc" }),
  });

  return {
    summary,
    seismoSignals,
    worklist,
    sources,
    seismoDays: SEISMO_DAYS,
  };
}
