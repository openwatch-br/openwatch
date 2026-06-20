'use client';

import React from 'react';

import Link from 'next/link';

import { formatBRL, formatDate } from '@/lib/utils';

import type { CaseTimelineItem } from '../helpers/buildCaseTimeline';

/** Severity → CSS color token (matches globals.css). */
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

interface CaseTimelineCardProps {
    /** The event to render. */
    item: CaseTimelineItem;
    /** Which side of the spine the card sits on (desktop). */
    side: 'left' | 'right';
}

/**
 * A single timeline event card: date, headline, source, value, and chips for
 * every involved person/org (each linking to their network view).
 */
export const CaseTimelineCard: React.FC<CaseTimelineCardProps> = ({ item, side }) => {
    const sevColor = SEV_COLOR[item.severity] ?? 'var(--color-text-3)';

    return (
        <div
            style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderLeftWidth: 3,
                borderLeftColor: sevColor,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                textAlign: side === 'left' ? 'right' : 'left',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                    flexDirection: side === 'left' ? 'row-reverse' : 'row',
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: sevColor,
                        background: `${sevColor}18`,
                        border: `1px solid ${sevColor}40`,
                        padding: '1px 6px',
                        borderRadius: 3,
                    }}
                >
                    {SEV_LABEL[item.severity] ?? item.severity.toUpperCase()}
                </span>
                <span
                    style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-3)',
                        letterSpacing: '0.04em',
                    }}
                >
                    {formatDate(item.date)}
                </span>
                {item.valueBrl != null && item.valueBrl > 0 && (
                    <span
                        style={{
                            fontSize: 13,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--color-amber)',
                            marginLeft: side === 'left' ? undefined : 'auto',
                            marginRight: side === 'left' ? 'auto' : undefined,
                        }}
                    >
                        {formatBRL(item.valueBrl)}
                    </span>
                )}
            </div>

            <p
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    lineHeight: 1.4,
                    marginBottom: 4,
                }}
            >
                {item.title}
            </p>

            {item.subtitle && (
                <p
                    style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: item.description ? 8 : 0,
                    }}
                >
                    {item.subtitle}
                </p>
            )}

            {item.description && (
                <p
                    style={{
                        fontSize: 12,
                        color: 'var(--color-text-2)',
                        lineHeight: 1.5,
                        marginBottom: item.participants.length > 0 ? 10 : 0,
                    }}
                >
                    {item.description}
                </p>
            )}

            {item.participants.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        justifyContent: side === 'left' ? 'flex-end' : 'flex-start',
                    }}
                >
                    {item.participants.map((p) => (
                        <Link
                            key={`${item.id}-${p.entityId}`}
                            href={`/radar/rede/${p.entityId}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <span
                                style={{
                                    fontSize: 11,
                                    color: 'var(--color-text-2)',
                                    background: 'var(--color-surface-2)',
                                    border: '1px solid var(--color-border)',
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    cursor: 'pointer',
                                }}
                                title={`${p.roleLabel}: ${p.name}`}
                            >
                                <span aria-hidden style={{ fontSize: 11 }}>
                                    {TYPE_ICON[p.type] ?? '•'}
                                </span>
                                {p.name}
                                <span style={{ color: 'var(--color-text-3)', fontSize: 10 }}>
                                    · {p.roleLabel}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CaseTimelineCard;
