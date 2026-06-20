'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';

import { EDGE_COLORS, NODE_COLOR_FALLBACK, NODE_COLORS } from '@/components/graph/graphStyle';
import type { GLink, GNode } from '@/hooks/useCaseGraph';
import type { DossierTimelineResponse } from '@/lib/types';

const SVG_W = 940;
const SVG_H = 500;
const PAD = { top: 32, right: 24, bottom: 40, left: 72 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;

// Normalised Y position (0–1) per entity type lane
const LANE_RATIO: Record<string, number> = {
    empresa: 0.12,
    company: 0.12,
    orgao: 0.5,
    org: 0.5,
    pessoa: 0.88,
    person: 0.88,
};

const LANE_LABELS: Array<{ key: string; label: string; ratio: number }> = [
    { key: 'empresa', label: 'Empresa', ratio: 0.12 },
    { key: 'orgao', label: 'Órgão', ratio: 0.5 },
    { key: 'pessoa', label: 'Pessoa', ratio: 0.88 },
];

function laneY(type: string): number {
    return PAD.top + PLOT_H * (LANE_RATIO[type] ?? 0.5);
}

function extractId(raw: unknown): string {
    if (typeof raw === 'string') return raw;
    const obj = raw as Record<string, unknown>;
    return typeof obj['id'] === 'string' ? obj['id'] : '';
}

interface TooltipState {
    svgX: number;
    svgY: number;
    link: GLink;
}

interface NodePos {
    x: number;
    y: number;
    date: string;
}

interface CaseChronologicGraphProps {
    /** Nodes from useCaseGraph */
    nodes: GNode[];
    /** Links from useCaseGraph (may be enriched) */
    links: GLink[];
    /** Degree per node id */
    degreeMap: Record<string, number>;
    /** Raw dossier timeline — used for per-entity event dates */
    timelineRaw: DossierTimelineResponse;
}

export function CaseChronologicGraph({
    nodes,
    links,
    degreeMap,
    timelineRaw,
}: CaseChronologicGraphProps): React.ReactElement {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // entity_id → first event date (ISO string, lexically comparable)
    const entityFirstDate = useMemo(() => {
        const map = new Map<string, string>();
        for (const ev of timelineRaw.events) {
            for (const p of ev.participants) {
                const cur = map.get(p.entity_id);
                if (!cur || ev.occurred_at < cur) {
                    map.set(p.entity_id, ev.occurred_at);
                }
            }
        }
        return map;
    }, [timelineRaw.events]);

    // Date range across all entities that appear in this graph
    const { minTs, maxTs } = useMemo(() => {
        let mn = Infinity;
        let mx = -Infinity;
        for (const node of nodes) {
            const d = entityFirstDate.get(node.entity_id);
            if (!d) continue;
            const t = new Date(d).getTime();
            if (t < mn) mn = t;
            if (t > mx) mx = t;
        }
        // Fallback: use timeline range
        if (!Number.isFinite(mn)) {
            const sorted = timelineRaw.events.map(e => new Date(e.occurred_at).getTime()).sort((a, b) => a - b);
            mn = sorted[0] ?? Date.now() - 1;
            mx = sorted[sorted.length - 1] ?? Date.now();
        }
        // Pad 5% on each side so nodes don't clip the edges
        const pad = (mx - mn) * 0.05 || 1;
        return { minTs: mn - pad, maxTs: mx + pad };
    }, [nodes, entityFirstDate, timelineRaw.events]);

    const tsRange = maxTs - minTs || 1;

    // Map ts → SVG x
    const toX = useCallback((ts: number): number => PAD.left + ((ts - minTs) / tsRange) * PLOT_W, [minTs, tsRange]);

    // Derive bucket layout data (shared between pos and overflow memos)
    const bucketData = useMemo(() => {
        // Sort nodes by degree descending so hubs are at bucket centre
        const sorted = [...nodes].sort((a, b) => (degreeMap[b.id] ?? 0) - (degreeMap[a.id] ?? 0));

        // Group by (type, month)
        const buckets = new Map<string, string[]>();
        for (const node of sorted) {
            const date = entityFirstDate.get(node.entity_id);
            const month = date ? date.slice(0, 7) : '__none';
            const key = `${node.node_type}::${month}`;
            const bucket = buckets.get(key) ?? [];
            bucket.push(node.id);
            buckets.set(key, bucket);
        }
        return buckets;
    }, [nodes, entityFirstDate, degreeMap]);

    // Compute node positions — grid layout within same (type, month) bucket
    const nodePos = useMemo<Record<string, NodePos>>(() => {
        const LANE_HALF    = 55;
        const X_SPREAD     = 26;
        const COL_ROWS     = 4;
        const MAX_VISIBLE  = 12;

        const pos: Record<string, NodePos> = {};

        for (const [key, ids] of bucketData.entries()) {
            const typePart = key.split('::')[0] ?? '';
            const visible = ids.slice(0, MAX_VISIBLE);
            const cols = Math.ceil(visible.length / COL_ROWS);

            for (let i = 0; i < visible.length; i++) {
                const id = visible[i];
                if (id === undefined) continue;
                const node = nodes.find(n => n.id === id);
                if (!node) continue;

                const date = entityFirstDate.get(node.entity_id) ?? new Date(minTs).toISOString();
                const ts = new Date(date).getTime();
                const baseX = toX(ts);
                const baseY = laneY(typePart || node.node_type);

                const col = Math.floor(i / COL_ROWS);
                const row = i % COL_ROWS;
                const rowsInCol = Math.min(COL_ROWS, visible.length - col * COL_ROWS);

                const xOff = cols > 1 ? (col - (cols - 1) / 2) * X_SPREAD : 0;
                const yStep = rowsInCol > 1 ? (LANE_HALF * 2) / (rowsInCol - 1) : 0;
                const yOff = rowsInCol > 1 ? -LANE_HALF + row * yStep : 0;

                pos[id] = { x: baseX + xOff, y: baseY + yOff, date };
            }
        }
        return pos;
    }, [bucketData, nodes, entityFirstDate, minTs, toX]);

    // Overflow badges — "+N" for buckets that exceed MAX_VISIBLE
    const overflowBadges = useMemo<Array<{ key: string; x: number; y: number; hidden: number }>>(() => {
        const LANE_HALF = 55;
        const MAX_VISIBLE = 12;
        const result: Array<{ key: string; x: number; y: number; hidden: number }> = [];

        for (const [key, ids] of bucketData.entries()) {
            const hiddenCount = ids.length - MAX_VISIBLE;
            if (hiddenCount <= 0) continue;
            const typePart = key.split('::')[0] ?? '';
            const firstId = ids[0];
            if (firstId === undefined) continue;
            const node = nodes.find(n => n.id === firstId);
            if (!node) continue;
            const date = entityFirstDate.get(node.entity_id) ?? new Date(minTs).toISOString();
            const baseY = laneY(typePart || node.node_type);
            result.push({
                key,
                x: toX(new Date(date).getTime()),
                y: baseY + LANE_HALF + 16,
                hidden: hiddenCount,
            });
        }
        return result;
    }, [bucketData, nodes, entityFirstDate, minTs, toX]);

    const nodeSet = useMemo(() => new Set(nodes.map(n => n.id)), [nodes]);

    // Build arc path between two nodes
    const arcPath = useCallback((src: string, tgt: string): string => {
        const s = nodePos[src];
        const t = nodePos[tgt];
        if (!s || !t) return '';
        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2;
        // Lift control point above both nodes for clear arc
        const dy = Math.abs(s.y - t.y);
        const lift = dy < 20 ? -55 : -35;
        return `M ${s.x} ${s.y} Q ${mx} ${my + lift} ${t.x} ${t.y}`;
    }, [nodePos]);

    const handleLinkEnter = useCallback(
        (e: React.MouseEvent<SVGPathElement>, link: GLink) => {
            const el = svgRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const scaleX = SVG_W / rect.width;
            const scaleY = SVG_H / rect.height;
            setTooltip({
                svgX: (e.clientX - rect.left) * scaleX,
                svgY: (e.clientY - rect.top) * scaleY,
                link,
            });
        },
        [],
    );

    const clearTooltip = useCallback(() => setTooltip(null), []);

    // Time-axis ticks
    const ticks = useMemo(() => {
        const start = new Date(minTs);
        const end = new Date(maxTs);
        const diffMonths =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
        const step = diffMonths > 36 ? 12 : diffMonths > 18 ? 6 : diffMonths > 8 ? 3 : 1;

        const result: Array<{ label: string; x: number }> = [];
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cursor.getTime() <= end.getTime()) {
            result.push({
                label:
                    step >= 12
                        ? String(cursor.getFullYear())
                        : `${String(cursor.getMonth() + 1).padStart(2, '0')}/${String(cursor.getFullYear()).slice(2)}`,
                x: toX(cursor.getTime()),
            });
            cursor.setMonth(cursor.getMonth() + step);
        }
        return result;
    }, [minTs, maxTs, toX]);

    const fmtDate = (iso: string): string =>
        new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    const fmtBrl = (v: number | null | undefined): string =>
        v != null
            ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
            : '—';

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                style={{
                    width: '100%',
                    height: SVG_H,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'block',
                }}
            >
                {/* Lane guide lines + labels */}
                {LANE_LABELS.map(lane => (
                    <g key={lane.key}>
                        <line
                            x1={PAD.left}
                            y1={PAD.top + PLOT_H * lane.ratio}
                            x2={SVG_W - PAD.right}
                            y2={PAD.top + PLOT_H * lane.ratio}
                            stroke='var(--color-border)'
                            strokeWidth={1}
                            strokeDasharray='4 3'
                        />
                        <text
                            x={PAD.left - 6}
                            y={PAD.top + PLOT_H * lane.ratio + 4}
                            fill='var(--color-text-3)'
                            fontSize={10}
                            fontFamily='var(--font-mono)'
                            textAnchor='end'
                        >
                            {lane.label}
                        </text>
                    </g>
                ))}

                {/* Time-axis ticks */}
                {ticks.map(tick => (
                    <g key={tick.label + tick.x}>
                        <line
                            x1={tick.x}
                            y1={PAD.top - 6}
                            x2={tick.x}
                            y2={SVG_H - PAD.bottom + 6}
                            stroke='var(--color-border)'
                            strokeWidth={1}
                            strokeOpacity={0.6}
                        />
                        <text
                            x={tick.x}
                            y={SVG_H - PAD.bottom + 18}
                            fill='var(--color-text-3)'
                            fontSize={9}
                            fontFamily='var(--font-mono)'
                            textAnchor='middle'
                        >
                            {tick.label}
                        </text>
                    </g>
                ))}

                {/* Edges (drawn below nodes) */}
                {links.map(link => {
                    const src = extractId(link.source);
                    const tgt = extractId(link.target);
                    if (!nodeSet.has(src) || !nodeSet.has(tgt)) return null;
                    const d = arcPath(src, tgt);
                    if (!d) return null;
                    const isAdj = hoveredNode === src || hoveredNode === tgt;
                    const edgeColor = EDGE_COLORS[link.type] ?? '#4A4A5A';
                    return (
                        <path
                            key={link.id}
                            d={d}
                            fill='none'
                            stroke={edgeColor}
                            strokeWidth={isAdj ? 2.5 : 1.5}
                            strokeOpacity={
                                hoveredNode !== null && !isAdj ? 0.1 : link.isFocused ? 0.9 : 0.55
                            }
                            strokeLinecap='round'
                            style={{ cursor: 'pointer', transition: 'stroke-opacity 0.12s, stroke-width 0.12s' }}
                            onMouseEnter={e => handleLinkEnter(e, link)}
                            onMouseLeave={clearTooltip}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                    const pos = nodePos[node.id];
                    if (!pos) return null;
                    const r = Math.max(5, Math.min(16, 5 + Math.sqrt(degreeMap[node.id] ?? 0) * 2.2));
                    const color = NODE_COLORS[node.node_type] ?? NODE_COLOR_FALLBACK;
                    const isHovered = hoveredNode === node.id;
                    const isDimmed = hoveredNode !== null && !isHovered;
                    const label = node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label;
                    const degree = degreeMap[node.id] ?? 0;
                    // Show label: always for seed/hub nodes (degree ≥ 4), or when hovered
                    const showLabel = isHovered || node.isSeed || degree >= 4;
                    return (
                        <g
                            key={node.id}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => { setHoveredNode(node.id); clearTooltip(); }}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={r}
                                fill={color}
                                fillOpacity={isDimmed ? 0.2 : 1}
                                stroke={node.isSeed ? '#fff' : 'transparent'}
                                strokeWidth={node.isSeed ? 2.5 : 0}
                                style={{ transition: 'fill-opacity 0.12s' }}
                            />
                            {showLabel && (
                                <text
                                    x={pos.x}
                                    y={pos.y + r + 11}
                                    fill='var(--color-text-2)'
                                    fillOpacity={isDimmed ? 0.2 : 0.9}
                                    fontSize={isHovered ? 10 : 8}
                                    fontWeight={node.isSeed ? '600' : '400'}
                                    fontFamily='var(--font-mono)'
                                    textAnchor='middle'
                                    style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill-opacity 0.12s' }}
                                >
                                    {label}
                                </text>
                            )}
                            {isHovered && (
                                <text
                                    x={pos.x}
                                    y={pos.y + r + (showLabel ? 22 : 11)}
                                    fill='var(--color-text-3)'
                                    fontSize={8}
                                    fontFamily='var(--font-mono)'
                                    textAnchor='middle'
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {fmtDate(pos.date)}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Overflow badges — "+N" for buckets exceeding MAX_VISIBLE */}
                {overflowBadges.map(badge => (
                    <g key={badge.key}>
                        <rect
                            x={badge.x - 16}
                            y={badge.y - 9}
                            width={32}
                            height={16}
                            rx={8}
                            fill='var(--color-border)'
                            opacity={0.7}
                        />
                        <text
                            x={badge.x}
                            y={badge.y + 4}
                            fill='var(--color-text-3)'
                            fontSize={9}
                            fontFamily='var(--font-mono)'
                            textAnchor='middle'
                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                            +{badge.hidden}
                        </text>
                    </g>
                ))}

                {/* Inline SVG tooltip for edge hover */}
                {tooltip && (() => {
                    const link = tooltip.link;
                    const ctx = link.context;
                    const px = Math.min(tooltip.svgX + 12, SVG_W - 220);
                    const py = Math.min(tooltip.svgY - 10, SVG_H - 130);
                    return (
                        <g onMouseLeave={clearTooltip} style={{ pointerEvents: 'all' }}>
                            <rect
                                x={px}
                                y={py}
                                width={210}
                                height={ctx ? 110 : 48}
                                rx={6}
                                fill='var(--color-surface-elevated, #1E1E2A)'
                                stroke='var(--color-border)'
                                strokeWidth={1}
                            />
                            <text x={px + 10} y={py + 18} fill='var(--color-text-1)' fontSize={11} fontFamily='var(--font-mono)' fontWeight='600'>
                                {link.type.replace(/_/g, ' ')}
                            </text>
                            {ctx ? (
                                <>
                                    <text x={px + 10} y={py + 34} fill='var(--color-text-3)' fontSize={9} fontFamily='var(--font-mono)'>
                                        {ctx.sharedEventCount} evento{ctx.sharedEventCount !== 1 ? 's' : ''} compartilhados
                                    </text>
                                    <text x={px + 10} y={py + 48} fill='var(--color-text-3)' fontSize={9} fontFamily='var(--font-mono)'>
                                        Total: {fmtBrl(ctx.totalValueBrl)}
                                    </text>
                                    {ctx.dateRange && (
                                        <text x={px + 10} y={py + 62} fill='var(--color-text-3)' fontSize={9} fontFamily='var(--font-mono)'>
                                            {fmtDate(ctx.dateRange.earliest)} → {fmtDate(ctx.dateRange.latest)}
                                        </text>
                                    )}
                                    {ctx.topEvents.slice(0, 2).map((ev, i) => (
                                        <text key={i} x={px + 10} y={py + 78 + i * 14} fill='var(--color-text-3)' fontSize={8} fontFamily='var(--font-mono)'>
                                            · {fmtDate(ev.occurred_at)} {ev.description.slice(0, 28)}…
                                        </text>
                                    ))}
                                </>
                            ) : (
                                <text x={px + 10} y={py + 34} fill='var(--color-text-3)' fontSize={9} fontFamily='var(--font-mono)'>
                                    peso: {link.weight} · {link.edge_strength ?? '—'}
                                </text>
                            )}
                        </g>
                    );
                })()}
            </svg>

            {/* Legend */}
            <div
                style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-3)',
                }}
            >
                {Object.entries(NODE_COLORS).filter(([k]) => !['empresa', 'org', 'person'].includes(k)).map(([type, color]) => (
                    <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        {type === 'company' ? 'Empresa' : type === 'orgao' ? 'Órgão' : type === 'pessoa' ? 'Pessoa' : type}
                    </span>
                ))}
                <span style={{ marginLeft: 'auto' }}>
                    eixo X = primeira ocorrência da entidade · passe o mouse sobre um link para detalhes
                </span>
            </div>
        </div>
    );
}

export default CaseChronologicGraph;
