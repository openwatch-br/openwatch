import { severityNumeric } from '@/lib/utils';
import type {
    DossierTimelineResponse,
    SignalSeverity,
    TimelineEntityDTO,
    TimelineEventDTO,
} from '@/lib/types';

/** A person/org participating in a timeline event, resolved against the case roster. */
export interface TimelineParticipant {
    /** Entity UUID — links to /entity/[entityId]. */
    entityId: string;
    /** Display name (resolved from the entity roster). */
    name: string;
    /** Entity type: person | company | org. */
    type: string;
    /** Human role in this event (e.g. "Comprador"). */
    roleLabel: string;
}

/** A single event positioned on the vertical time-scale axis. */
export interface CaseTimelineItem {
    id: string;
    /** ISO date of the event (occurred_at). */
    date: string;
    /** Epoch ms — used for ordering and time-scale offset. */
    timestamp: number;
    /** Headline (humanized event type). */
    title: string;
    /** Secondary line (typologies or source). */
    subtitle: string;
    /** Free-text detail from the source. */
    description: string;
    /** Monetary value in BRL, when the source provides one. */
    valueBrl: number | null;
    /** Highest severity among the event's embedded signals. */
    severity: SignalSeverity;
    /** Distinct typology codes touching this event. */
    typologyCodes: string[];
    /** Everyone involved in this event. */
    participants: TimelineParticipant[];
    /** Normalized 0..1 position on the time axis (time-scale). */
    offset: number;
    /** Originating connector (e.g. "tce_rj"). */
    sourceConnector: string;
}

/** The full view-model consumed by <CaseTimeline />. */
export interface CaseTimelineModel {
    items: CaseTimelineItem[];
    /** Full involved-people roster for the case. */
    entities: TimelineEntityDTO[];
    startDate: string | null;
    endDate: string | null;
    severity: SignalSeverity;
    title: string;
}

const SEVERITY_ORDER: SignalSeverity[] = ['low', 'medium', 'high', 'critical'];

/** Turn a snake_case event type into a readable title, uppercasing short acronyms. */
export function humanizeEventType(type: string): string {
    const raw = (type ?? '').trim();
    if (!raw) return 'Evento';
    return raw
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((word) =>
            word.length <= 3
                ? word.toUpperCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}

function maxSeverity(event: TimelineEventDTO): SignalSeverity {
    let best: SignalSeverity = 'medium';
    let bestScore = -1;
    for (const signal of event.signals ?? []) {
        const score = severityNumeric(signal.severity);
        if (score > bestScore) {
            bestScore = score;
            best = SEVERITY_ORDER.includes(signal.severity) ? signal.severity : best;
        }
    }
    return best;
}

function shortId(entityId: string): string {
    return `Entidade ${entityId.slice(0, 8)}`;
}

/**
 * Transform the case dossier-timeline payload into an ordered, time-scaled
 * view-model. Events are the primary rows; participants are resolved against the
 * case entity roster so every involved person/org can be linked.
 */
export function buildCaseTimeline(data: DossierTimelineResponse): CaseTimelineModel {
    const entityById = new Map<string, TimelineEntityDTO>();
    for (const entity of data.entities ?? []) {
        entityById.set(entity.id, entity);
    }

    const seen = new Set<string>();
    const rows: CaseTimelineItem[] = [];

    for (const event of data.events ?? []) {
        if (seen.has(event.id)) continue;
        const timestamp = Date.parse(event.occurred_at ?? '');
        if (Number.isNaN(timestamp)) continue;
        seen.add(event.id);

        const typologyCodes = Array.from(
            new Set((event.signals ?? []).map((s) => s.typology_code).filter(Boolean)),
        );
        const typologyNames = Array.from(
            new Set((event.signals ?? []).map((s) => s.typology_name).filter(Boolean)),
        );

        const participants: TimelineParticipant[] = (event.participants ?? []).map((p) => {
            const entity = entityById.get(p.entity_id);
            return {
                entityId: p.entity_id,
                name: entity?.name ?? shortId(p.entity_id),
                type: entity?.type ?? 'org',
                roleLabel: p.role_label || p.role || 'Participante',
            };
        });

        rows.push({
            id: event.id,
            date: event.occurred_at,
            timestamp,
            title: humanizeEventType(event.type),
            subtitle: typologyNames.length > 0 ? typologyNames.join(' · ') : event.source_connector,
            description: event.description ?? '',
            valueBrl: event.value_brl,
            severity: maxSeverity(event),
            typologyCodes,
            participants,
            offset: 0,
            sourceConnector: event.source_connector ?? '',
        });
    }

    rows.sort((a, b) => a.timestamp - b.timestamp);

    const min = rows.length > 0 ? rows[0]!.timestamp : 0;
    const max = rows.length > 0 ? rows[rows.length - 1]!.timestamp : 0;
    const span = max - min;
    for (const row of rows) {
        row.offset = span > 0 ? (row.timestamp - min) / span : 0;
    }

    return {
        items: rows,
        entities: data.entities ?? [],
        startDate: rows.length > 0 ? rows[0]!.date : null,
        endDate: rows.length > 0 ? rows[rows.length - 1]!.date : null,
        severity: data.case.severity,
        title: data.case.title,
    };
}
