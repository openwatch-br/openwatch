'use client';

import React from 'react';

import Link from 'next/link';

import { formatDate } from '@/lib/utils';

import type { CaseTimelineModel } from '../helpers/buildCaseTimeline';

const SEV_COLOR: Record<string, string> = {
    critical: 'var(--color-critical)',
    high: 'var(--color-high)',
    medium: 'var(--color-medium)',
    low: 'var(--color-low)',
};

const SEV_LABEL: Record<string, string> = {
    critical: 'CRÍTICO',
    high: 'ALTO',
    medium: 'MÉDIO',
    low: 'BAIXO',
};

const TYPE_ICON: Record<string, string> = {
    person: '👤',
    company: '🏢',
    org: '🏛',
};

interface CaseTimelineHeaderProps {
    model: CaseTimelineModel;
    eventCount: number;
}

/** Case detail header: case meta + involved-people roster. */
export const CaseTimelineHeader: React.FC<CaseTimelineHeaderProps> = ({ model, eventCount }) => {
    const sevColor = SEV_COLOR[model.severity] ?? 'var(--color-text-3)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <Link
                href="/radar"
                style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-3)',
                    textDecoration: 'none',
                }}
            >
                ← Radar
            </Link>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                <span
                    style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: sevColor,
                        background: `${sevColor}18`,
                        border: `1px solid ${sevColor}40`,
                        padding: '2px 8px',
                        borderRadius: 3,
                        flexShrink: 0,
                        marginTop: 4,
                    }}
                >
                    {SEV_LABEL[model.severity] ?? model.severity.toUpperCase()}
                </span>
                <h1
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        margin: 0,
                        lineHeight: 1.25,
                    }}
                >
                    {model.title}
                </h1>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    fontSize: 12,
                    color: 'var(--color-text-3)',
                    fontFamily: 'var(--font-mono)',
                }}
            >
                {model.startDate && model.endDate && (
                    <span>
                        {formatDate(model.startDate)} → {formatDate(model.endDate)}
                    </span>
                )}
                <span>
                    <strong style={{ color: 'var(--color-text-2)' }}>{eventCount}</strong> eventos
                </span>
                <span>
                    <strong style={{ color: 'var(--color-text-2)' }}>{model.entities.length}</strong>{' '}
                    envolvidos
                </span>
            </div>

            {/* Involved-people roster */}
            {model.entities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {model.entities.map((ent) => (
                        <Link
                            key={ent.id}
                            href={`/radar/rede/${ent.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <span
                                style={{
                                    fontSize: 12,
                                    color: 'var(--color-text-2)',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    cursor: 'pointer',
                                }}
                            >
                                <span aria-hidden>{TYPE_ICON[ent.type] ?? '•'}</span>
                                {ent.name}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CaseTimelineHeader;
