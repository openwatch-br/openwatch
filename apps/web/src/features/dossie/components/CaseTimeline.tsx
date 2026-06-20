'use client';

import React, { useMemo } from 'react';

import type { CaseTimelineItem, CaseTimelineModel } from '../helpers/buildCaseTimeline';
import { CaseTimelineCard } from './CaseTimelineCard';

/** px spread applied to the full time range (proportional component). */
const SCALE = 560;
/** Minimum px gap between consecutive markers (keeps dense clusters readable). */
const MIN_GAP = 32;

const SEV_COLOR: Record<string, string> = {
    critical: 'var(--color-critical)',
    high: 'var(--color-high)',
    medium: 'var(--color-medium)',
    low: 'var(--color-low)',
};

interface CaseTimelineProps {
    model: CaseTimelineModel;
}

function yearOf(date: string): string {
    return date.slice(0, 4);
}

/** Vertical, time-scale timeline: central spine, severity markers, alternating cards. */
export const CaseTimeline: React.FC<CaseTimelineProps> = ({ model }) => {
    const rows = useMemo(
        () =>
            model.items.map((item, index) => {
                const prev = index > 0 ? model.items[index - 1] : undefined;
                const gapFraction = prev ? item.offset - prev.offset : 0;
                const marginTop = index === 0 ? 0 : MIN_GAP + gapFraction * SCALE;
                const showYear = !prev || yearOf(prev.date) !== yearOf(item.date);
                return { item, index, marginTop, showYear };
            }),
        [model.items],
    );

    if (model.items.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--color-text-3)',
                    fontSize: 13,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                Nenhum evento datado disponível para este caso.
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', paddingTop: 8 }}>
            {/* central spine */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    width: 2,
                    transform: 'translateX(-1px)',
                    background:
                        'linear-gradient(180deg, transparent 0, var(--color-border) 24px, var(--color-border) calc(100% - 24px), transparent 100%)',
                }}
            />

            {rows.map(({ item, index, marginTop, showYear }) => (
                <TimelineRow
                    key={item.id}
                    item={item}
                    side={index % 2 === 0 ? 'left' : 'right'}
                    marginTop={marginTop}
                    showYear={showYear}
                />
            ))}
        </div>
    );
};

interface TimelineRowProps {
    item: CaseTimelineItem;
    side: 'left' | 'right';
    marginTop: number;
    showYear: boolean;
}

const TimelineRow: React.FC<TimelineRowProps> = ({ item, side, marginTop, showYear }) => {
    const sevColor = SEV_COLOR[item.severity] ?? 'var(--color-text-3)';

    return (
        <div style={{ marginTop }}>
            {showYear && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: 12,
                    }}
                >
                    <span
                        style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--color-text-2)',
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 12px',
                            letterSpacing: '0.08em',
                        }}
                    >
                        {yearOf(item.date)}
                    </span>
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 40px 1fr',
                    alignItems: 'center',
                }}
            >
                {/* left half */}
                <div style={{ minWidth: 0 }}>
                    {side === 'left' && <CaseTimelineCard item={item} side="left" />}
                </div>

                {/* marker */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: sevColor,
                            border: '3px solid var(--color-bg)',
                            boxShadow: `0 0 0 1px ${sevColor}`,
                            zIndex: 1,
                        }}
                        title={item.title}
                    />
                </div>

                {/* right half */}
                <div style={{ minWidth: 0 }}>
                    {side === 'right' && <CaseTimelineCard item={item} side="right" />}
                </div>
            </div>
        </div>
    );
};

export default CaseTimeline;
