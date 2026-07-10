import type {
  DossierTimelineResponse,
  SignalSeverity,
  TimelineEntityDTO,
  TimelineSignalDTO,
} from "@/lib/types";
import { TYPOLOGY_LABELS } from "@/lib/constants";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface DossieChapter {
  /** Two-digit reading order, e.g. "01". */
  num: string;
  /** Stable anchor / route id — the typology code. */
  typologyCode: string;
  title: string;
  severity: SignalSeverity;
  signals: TimelineSignalDTO[];
  entities: TimelineEntityDTO[];
  totalValue: number;
  /** 0-100, or null when no signal in the chapter carries a confidence value. */
  avgConfidence: number | null;
}

function maxSeverity(signals: TimelineSignalDTO[]): SignalSeverity {
  return signals.reduce<SignalSeverity>((max, s) => {
    return (SEVERITY_ORDER[s.severity] ?? 3) < (SEVERITY_ORDER[max] ?? 3)
      ? s.severity
      : max;
  }, "low");
}

/**
 * Groups a dossier's signals into ordered chapters (one per typology), sorted
 * by severity then code — the same ordering the book sequence uses — and
 * enriches each with the entities, value and confidence derived from the
 * events that reference its signals. Pure: no fabricated narrative.
 */
export function buildDossieChapters(
  data: DossierTimelineResponse,
): DossieChapter[] {
  const byTypology = new Map<string, TimelineSignalDTO[]>();
  for (const signal of data.signals) {
    if (!signal.typology_code) continue;
    const existing = byTypology.get(signal.typology_code);
    if (existing) existing.push(signal);
    else byTypology.set(signal.typology_code, [signal]);
  }

  const entityMap = new Map(data.entities.map((e) => [e.id, e]));

  const chapters = [...byTypology.entries()]
    .map(([code, signals]) => ({ code, signals, sev: maxSeverity(signals) }))
    .sort((a, b) => {
      const diff = (SEVERITY_ORDER[a.sev] ?? 3) - (SEVERITY_ORDER[b.sev] ?? 3);
      return diff !== 0 ? diff : a.code.localeCompare(b.code);
    });

  return chapters.map(({ code, signals, sev }, i) => {
    const signalIds = new Set(signals.map((s) => s.id));
    const chapterEvents = data.events.filter((evt) =>
      evt.signals.some((es) => signalIds.has(es.id)),
    );
    const entityIds = new Set<string>();
    for (const evt of chapterEvents) {
      for (const p of evt.participants) entityIds.add(p.entity_id);
    }
    const entities = [...entityIds]
      .map((id) => entityMap.get(id))
      .filter((e): e is TimelineEntityDTO => e != null);
    const totalValue = chapterEvents.reduce(
      (sum, evt) => sum + (evt.value_brl ?? 0),
      0,
    );
    // Signals may carry signal_confidence_score (0-100) or confidence (0-1);
    // either may be absent — skip missing values instead of averaging NaN.
    const confidenceScores = signals
      .map((s) =>
        s.signal_confidence_score ??
        (s.confidence != null ? s.confidence * 100 : null),
      )
      .filter((n): n is number => n != null && Number.isFinite(n));
    const avgConfidence = confidenceScores.length
      ? Math.round(
          confidenceScores.reduce((sum, n) => sum + n, 0) /
            confidenceScores.length,
        )
      : null;

    return {
      num: String(i + 1).padStart(2, "0"),
      typologyCode: code,
      title: TYPOLOGY_LABELS[code] ?? signals[0]?.typology_name ?? code,
      severity: sev,
      signals,
      entities,
      totalValue,
      avgConfidence,
    };
  });
}

/** Rough reading-time estimate from the volume of narrative material. */
export function estimateReadingMinutes(data: DossierTimelineResponse): number {
  const summaryChars =
    (data.case.summary?.length ?? 0) +
    data.signals.reduce((sum, s) => sum + (s.summary?.length ?? 0) + s.title.length, 0);
  const words = summaryChars / 5;
  return Math.max(2, Math.round(words / 200) + data.signals.length);
}

/** Distinct source connectors feeding this dossier's events. */
export function countSources(data: DossierTimelineResponse): number {
  const set = new Set<string>();
  for (const evt of data.events) {
    if (evt.source_connector) set.add(evt.source_connector);
  }
  return set.size;
}

export interface DossieFinding {
  signal: TimelineSignalDTO;
  typologyCode: string;
}

/**
 * The single most load-bearing signal (highest confidence, then severity) —
 * surfaced as the dossiê's pull-quote / finding callout.
 */
export function pickFinding(
  data: DossierTimelineResponse,
): DossieFinding | null {
  const ranked = [...data.signals].sort((a, b) => {
    const sev = (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
    if (sev !== 0) return sev;
    return b.confidence - a.confidence;
  });
  const top = ranked[0];
  return top ? { signal: top, typologyCode: top.typology_code } : null;
}
