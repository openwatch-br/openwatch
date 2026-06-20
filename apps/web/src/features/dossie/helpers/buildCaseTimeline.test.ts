import { describe, expect, it } from 'vitest';

import { buildCaseTimeline, humanizeEventType } from './buildCaseTimeline';
import type {
    DossierTimelineResponse,
    TimelineEntityDTO,
    TimelineEventDTO,
} from '@/lib/types';

const ENTITY_A: TimelineEntityDTO = {
    id: 'ent-a',
    type: 'org',
    name: 'PREFEITURA EXEMPLO',
    identifiers: { cnpj: '12345678000199' },
    attrs: {},
};

const ENTITY_B: TimelineEntityDTO = {
    id: 'ent-b',
    type: 'person',
    name: 'FULANO DA SILVA',
    identifiers: {},
    attrs: {},
};

function event(overrides: Partial<TimelineEventDTO> & Pick<TimelineEventDTO, 'id'>): TimelineEventDTO {
    return {
        id: overrides.id,
        type: overrides.type ?? 'contrato',
        occurred_at: overrides.occurred_at ?? '2024-01-01T00:00:00+00:00',
        description: overrides.description ?? 'desc',
        value_brl: overrides.value_brl ?? null,
        source_connector: overrides.source_connector ?? 'pncp',
        attrs: overrides.attrs ?? {},
        participants: overrides.participants ?? [],
        signals: overrides.signals ?? [],
    };
}

function dossier(events: TimelineEventDTO[], entities: TimelineEntityDTO[] = [ENTITY_A, ENTITY_B]): DossierTimelineResponse {
    return {
        case: {
            id: 'case-1',
            title: 'Caso: Exemplo',
            severity: 'high',
            status: 'open',
            summary: 'resumo',
            attrs: {},
        },
        entities,
        events,
        signals: [],
        legal_hypotheses: [],
        related_cases: [],
    };
}

describe('humanizeEventType', () => {
    it('title-cases words and uppercases short acronym tokens', () => {
        expect(humanizeEventType('penalidade_tce_rj')).toBe('Penalidade TCE RJ');
        expect(humanizeEventType('contrato')).toBe('Contrato');
        expect(humanizeEventType('')).toBe('Evento');
    });
});

describe('buildCaseTimeline', () => {
    it('returns empty items and null bounds for a case with no events', () => {
        const model = buildCaseTimeline(dossier([]));
        expect(model.items).toEqual([]);
        expect(model.startDate).toBeNull();
        expect(model.endDate).toBeNull();
        expect(model.entities).toHaveLength(2);
        expect(model.severity).toBe('high');
        expect(model.title).toBe('Caso: Exemplo');
    });

    it('sorts events chronologically ascending', () => {
        const model = buildCaseTimeline(
            dossier([
                event({ id: 'c', occurred_at: '2024-06-01T00:00:00+00:00' }),
                event({ id: 'a', occurred_at: '2020-01-01T00:00:00+00:00' }),
                event({ id: 'b', occurred_at: '2022-03-01T00:00:00+00:00' }),
            ]),
        );
        expect(model.items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    });

    it('computes proportional time-scale offsets (0..1) reflecting elapsed time', () => {
        const model = buildCaseTimeline(
            dossier([
                event({ id: 'a', occurred_at: '2020-01-01T00:00:00+00:00' }),
                event({ id: 'b', occurred_at: '2021-01-01T00:00:00+00:00' }),
                event({ id: 'c', occurred_at: '2024-01-01T00:00:00+00:00' }),
            ]),
        );
        const offsets = model.items.map((i) => i.offset);
        expect(offsets[0]).toBe(0);
        expect(offsets[2]).toBe(1);
        // 2021 is ~1 of 4 years from 2020 -> ~0.25
        expect(offsets[1]).toBeGreaterThan(0.2);
        expect(offsets[1]).toBeLessThan(0.3);
    });

    it('gives a single event offset 0 and equal start/end bounds', () => {
        const model = buildCaseTimeline(dossier([event({ id: 'solo', occurred_at: '2023-05-05T00:00:00+00:00' })]));
        expect(model.items).toHaveLength(1);
        expect(model.items[0]!.offset).toBe(0);
        expect(model.startDate).toBe(model.endDate);
    });

    it('filters out events with missing or invalid dates', () => {
        const model = buildCaseTimeline(
            dossier([
                event({ id: 'ok', occurred_at: '2024-01-01T00:00:00+00:00' }),
                event({ id: 'empty', occurred_at: '' }),
                event({ id: 'bad', occurred_at: 'not-a-date' }),
            ]),
        );
        expect(model.items.map((i) => i.id)).toEqual(['ok']);
    });

    it('resolves participant names and types from the entity roster', () => {
        const model = buildCaseTimeline(
            dossier([
                event({
                    id: 'e1',
                    participants: [
                        { entity_id: 'ent-a', role: 'buyer', role_label: 'Comprador' },
                        { entity_id: 'ent-b', role: 'agent', role_label: 'Agente' },
                    ],
                }),
            ]),
        );
        const p = model.items[0]!.participants;
        expect(p).toHaveLength(2);
        expect(p[0]).toMatchObject({ entityId: 'ent-a', name: 'PREFEITURA EXEMPLO', type: 'org', roleLabel: 'Comprador' });
        expect(p[1]).toMatchObject({ entityId: 'ent-b', name: 'FULANO DA SILVA', type: 'person', roleLabel: 'Agente' });
    });

    it('falls back gracefully when a participant is not in the roster', () => {
        const model = buildCaseTimeline(
            dossier(
                [event({ id: 'e1', participants: [{ entity_id: 'ghost', role: 'x', role_label: 'Desconhecido' }] })],
                [ENTITY_A],
            ),
        );
        const p = model.items[0]!.participants[0]!;
        expect(p.entityId).toBe('ghost');
        expect(p.name.length).toBeGreaterThan(0);
    });

    it('derives item severity from the highest-severity embedded signal', () => {
        const model = buildCaseTimeline(
            dossier([
                event({
                    id: 'e1',
                    signals: [
                        { id: 's1', typology_code: 'T10', typology_name: 'A', severity: 'medium', title: 't', factors: [], period_start: '', period_end: '', confidence: 0.5 },
                        { id: 's2', typology_code: 'T26', typology_name: 'B', severity: 'critical', title: 't', factors: [], period_start: '', period_end: '', confidence: 0.9 },
                    ],
                }),
            ]),
        );
        expect(model.items[0]!.severity).toBe('critical');
        expect(model.items[0]!.typologyCodes).toEqual(expect.arrayContaining(['T10', 'T26']));
    });

    it('dedupes events sharing the same id', () => {
        const model = buildCaseTimeline(
            dossier([
                event({ id: 'dup', occurred_at: '2024-01-01T00:00:00+00:00' }),
                event({ id: 'dup', occurred_at: '2024-01-01T00:00:00+00:00' }),
            ]),
        );
        expect(model.items).toHaveLength(1);
    });

    it('carries value and source through to the item', () => {
        const model = buildCaseTimeline(
            dossier([event({ id: 'e1', value_brl: 1922533.05, source_connector: 'tce_rj' })]),
        );
        expect(model.items[0]!.valueBrl).toBe(1922533.05);
        expect(model.items[0]!.sourceConnector).toBe('tce_rj');
    });
});
