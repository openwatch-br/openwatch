'use client';

import React, { useMemo, useState, useCallback } from 'react';

import { NODE_COLOR_FALLBACK, edgeColor, nodeColor } from '@/components/graph/graphStyle';
import type { GLink, GNode } from '@/hooks/useCaseGraph';

const SVG_W = 900;
const SVG_H = 540;
const CX = SVG_W / 2;
const CY = SVG_H / 2 + 12;
const MAX_RING = 20;
const EGO_R = 26;
const MIN_NODE_R = 7;
const MAX_NODE_R = 19;

function nodeRadius(degree: number): number {
    return Math.min(MAX_NODE_R, MIN_NODE_R + Math.sqrt(degree) * 2.2);
}

function ringRadius(count: number): number {
    if (count <= 6) return 185;
    if (count <= 12) return 215;
    return 252;
}

const EDGE_TYPE_LABELS: Record<string, string> = {
    contratou: 'Contratou',
    compra_fornecimento: 'Fornecimento',
    sociedade: 'Sociedade',
    socio: 'Sócio',
    participou: 'Participou',
    SAME_SOCIO: 'Mesmo Sócio',
    agente_publico_favorecido: 'Agente Favorecido',
    coparticipacao_evento: 'Co-participação',
    co_participation: 'Co-participação',
    supplier_chain: 'Fornecimento',
    same_cluster_entity: 'Mesma Entidade',
    SAME_ADDRESS: 'Mesmo Endereço',
    SHARES_PHONE: 'Mesmo Telefone',
    SUBSIDIARY: 'Subsidiária',
    HOLDING: 'Holding',
};

const NODE_TYPE_LABELS: Record<string, string> = {
    org: 'Órgão Público',
    orgao: 'Órgão Público',
    company: 'Empresa',
    empresa: 'Empresa',
    person: 'Pessoa',
    pessoa: 'Pessoa',
};

interface NodePos {
    node: GNode;
    cx: number;
    cy: number;
    r: number;
    degree: number;
}

interface TooltipState {
    svgX: number;
    svgY: number;
    node: GNode;
    degree: number;
    linkCount: number;
}

export interface CaseEgoGraphProps {
    nodes: GNode[];
    links: GLink[];
    degreeMap: Record<string, number>;
}

export function CaseEgoGraph({ nodes, links, degreeMap }: CaseEgoGraphProps): React.ReactElement {
    const nodeMap = useMemo<Record<string, GNode>>(() => {
        const m: Record<string, GNode> = {};
        for (const n of nodes) m[n.id] = n;
        return m;
    }, [nodes]);

    const seedId = useMemo(() => {
        const seed = nodes.find(n => n.isSeed);
        if (seed) return seed.id;
        return nodes.reduce(
            (best, n) => ((degreeMap[n.id] ?? 0) > (degreeMap[best] ?? 0) ? n.id : best),
            nodes[0]?.id ?? '',
        );
    }, [nodes, degreeMap]);

    const [egoId, setEgoId] = useState<string>(seedId);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [hiddenEdgeTypes, setHiddenEdgeTypes] = useState<Set<string>>(new Set());

    const egoNode = nodeMap[egoId];

    const allEdgeTypes = useMemo(() => {
        const seen = new Set<string>();
        for (const l of links) seen.add(l.type);
        return Array.from(seen).sort();
    }, [links]);

    const egoLinks = useMemo(
        () =>
            links.filter(
                l =>
                    !hiddenEdgeTypes.has(l.type) &&
                    (l.source === egoId || l.target === egoId),
            ),
        [links, egoId, hiddenEdgeTypes],
    );

    const { ringNodes, hiddenCount } = useMemo(() => {
        const seen = new Set<string>();
        for (const l of egoLinks) {
            const other = l.source === egoId ? l.target : l.source;
            seen.add(other);
        }
        const sorted = Array.from(seen)
            .map(id => nodeMap[id])
            .filter((n): n is GNode => n !== undefined)
            .sort((a, b) => (degreeMap[b.id] ?? 0) - (degreeMap[a.id] ?? 0));
        return {
            ringNodes: sorted.slice(0, MAX_RING),
            hiddenCount: Math.max(0, sorted.length - MAX_RING),
        };
    }, [egoLinks, egoId, nodeMap, degreeMap]);

    const rr = ringRadius(ringNodes.length);

    const ringPositions = useMemo<NodePos[]>(
        () =>
            ringNodes.map((node, i) => {
                const angle = (2 * Math.PI * i) / Math.max(ringNodes.length, 1) - Math.PI / 2;
                return {
                    node,
                    cx: CX + rr * Math.cos(angle),
                    cy: CY + rr * Math.sin(angle),
                    r: nodeRadius(degreeMap[node.id] ?? 0),
                    degree: degreeMap[node.id] ?? 0,
                };
            }),
        [ringNodes, rr, degreeMap],
    );

    const posMap = useMemo<Record<string, NodePos>>(() => {
        const m: Record<string, NodePos> = {};
        for (const p of ringPositions) m[p.node.id] = p;
        return m;
    }, [ringPositions]);

    const ringEdgeLinks = useMemo(() => {
        const inRing = new Set(ringNodes.map(n => n.id));
        return links.filter(
            l =>
                !hiddenEdgeTypes.has(l.type) &&
                l.source !== egoId &&
                l.target !== egoId &&
                inRing.has(l.source) &&
                inRing.has(l.target),
        );
    }, [links, ringNodes, egoId, hiddenEdgeTypes]);

    const handleNodeClick = useCallback(
        (nodeId: string) => {
            setEgoId(nodeId === egoId ? seedId : nodeId);
            setTooltip(null);
            setHoveredId(null);
        },
        [egoId, seedId],
    );

    const handleHover = useCallback(
        (_e: React.MouseEvent<SVGElement>, node: GNode, svgX: number, svgY: number) => {
            setHoveredId(node.id);
            setTooltip({
                svgX,
                svgY,
                node,
                degree: degreeMap[node.id] ?? 0,
                linkCount: egoLinks.filter(l => l.source === node.id || l.target === node.id).length,
            });
        },
        [degreeMap, egoLinks],
    );

    const handleLeave = useCallback(() => {
        setHoveredId(null);
        setTooltip(null);
    }, []);

    const toggleEdgeType = useCallback((type: string) => {
        setHiddenEdgeTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    }, []);

    if (!egoNode) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: 48,
                    color: 'var(--color-text-3)',
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                }}
            >
                Nenhum nó disponível.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minHeight: 28 }}>
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--color-text-3)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    tipo de relação:
                </span>
                {allEdgeTypes.map(type => {
                    const off = hiddenEdgeTypes.has(type);
                    return (
                        <button
                            key={type}
                            type='button'
                            onClick={() => toggleEdgeType(type)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 11,
                                fontFamily: 'var(--font-mono)',
                                color: off ? 'var(--color-text-3)' : 'var(--color-text-2)',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-full)',
                                padding: '3px 9px',
                                cursor: 'pointer',
                                opacity: off ? 0.4 : 1,
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: edgeColor(type),
                                    flexShrink: 0,
                                }}
                            />
                            {EDGE_TYPE_LABELS[type] ?? type}
                        </button>
                    );
                })}

                {egoId !== seedId && (
                    <button
                        type='button'
                        onClick={() => {
                            setEgoId(seedId);
                            setTooltip(null);
                        }}
                        style={{
                            marginLeft: 'auto',
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-accent, #5CA8FF)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '3px 6px',
                        }}
                    >
                        ← voltar ao início
                    </button>
                )}
            </div>

            {/* Graph */}
            <div
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                }}
            >
                <svg
                    width='100%'
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    style={{ display: 'block' }}
                    onMouseLeave={handleLeave}
                >
                    {/* Ring-to-ring edges (dashed) */}
                    {ringEdgeLinks.map(l => {
                        const sp = posMap[l.source];
                        const tp = posMap[l.target];
                        if (!sp || !tp) return null;
                        const isHigh = hoveredId === l.source || hoveredId === l.target;
                        const mx = (sp.cx + tp.cx) / 2;
                        const my = (sp.cy + tp.cy) / 2;
                        const dx = mx - CX;
                        const dy = my - CY;
                        const len = Math.sqrt(dx * dx + dy * dy) || 1;
                        const qx = mx + (dx / len) * 28;
                        const qy = my + (dy / len) * 28;
                        return (
                            <path
                                key={l.id + '-rr'}
                                d={`M ${sp.cx} ${sp.cy} Q ${qx} ${qy} ${tp.cx} ${tp.cy}`}
                                fill='none'
                                stroke={edgeColor(l.type)}
                                strokeWidth={isHigh ? 1.8 : 0.9}
                                strokeDasharray='4 3'
                                opacity={hoveredId && !isHigh ? 0.07 : 0.38}
                            />
                        );
                    })}

                    {/* Ego-to-ring edges */}
                    {egoLinks.map(l => {
                        const otherId = l.source === egoId ? l.target : l.source;
                        const rp = posMap[otherId];
                        if (!rp) return null;
                        const isHigh = hoveredId === otherId;
                        const strong = l.edge_strength === 'strong';
                        return (
                            <line
                                key={l.id}
                                x1={CX}
                                y1={CY}
                                x2={rp.cx}
                                y2={rp.cy}
                                stroke={edgeColor(l.type)}
                                strokeWidth={isHigh ? 2.5 : strong ? 1.8 : 1.1}
                                opacity={hoveredId && !isHigh ? 0.05 : 0.5}
                            />
                        );
                    })}

                    {/* Ring nodes */}
                    {ringPositions.map(({ node, cx, cy, r }) => {
                        const isHigh = hoveredId === node.id;
                        const color = nodeColor(node.node_type) ?? NODE_COLOR_FALLBACK;
                        // Always show labels; shorten to fit ring density
                        const maxChars = ringNodes.length <= 8 ? 22 : ringNodes.length <= 14 ? 14 : 10;
                        const label =
                            node.label.length > maxChars
                                ? node.label.slice(0, maxChars - 1) + '…'
                                : node.label;
                        return (
                            <g
                                key={node.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleNodeClick(node.id)}
                                onMouseEnter={e => handleHover(e, node, cx, cy)}
                                onMouseLeave={handleLeave}
                            >
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isHigh ? r + 3 : r}
                                    fill={color}
                                    stroke={isHigh ? '#fff' : 'transparent'}
                                    strokeWidth={2}
                                    opacity={hoveredId && !isHigh ? 0.28 : 0.88}
                                />
                                <text
                                    x={cx}
                                    y={cy + r + 13}
                                    textAnchor='middle'
                                    fontSize={isHigh ? 11 : 9}
                                    fontFamily='var(--font-mono)'
                                    fill='var(--color-text-2)'
                                    opacity={hoveredId && !isHigh ? 0.15 : isHigh ? 1 : 0.75}
                                    fontWeight={isHigh ? '600' : 'normal'}
                                >
                                    {isHigh && node.label.length > 22 ? node.label.slice(0, 21) + '…' : label}
                                </text>
                            </g>
                        );
                    })}

                    {/* +N hidden badge */}
                    {hiddenCount > 0 && (
                        <text
                            x={CX}
                            y={SVG_H - 10}
                            textAnchor='middle'
                            fontSize={10}
                            fontFamily='var(--font-mono)'
                            fill='var(--color-text-3)'
                        >
                            +{hiddenCount} conexões ocultas — exibindo top {MAX_RING} por grau
                        </text>
                    )}

                    {/* Ego node */}
                    <g
                        style={{ cursor: egoId !== seedId ? 'pointer' : 'default' }}
                        onClick={() => egoId !== seedId && handleNodeClick(egoId)}
                        onMouseEnter={e => handleHover(e, egoNode, CX, CY)}
                        onMouseLeave={handleLeave}
                    >
                        {/* Halo */}
                        <circle
                            cx={CX}
                            cy={CY}
                            r={EGO_R + 10}
                            fill={nodeColor(egoNode.node_type) ?? NODE_COLOR_FALLBACK}
                            opacity={0.1}
                        />
                        <circle
                            cx={CX}
                            cy={CY}
                            r={EGO_R + 5}
                            fill={nodeColor(egoNode.node_type) ?? NODE_COLOR_FALLBACK}
                            opacity={0.16}
                        />
                        <circle
                            cx={CX}
                            cy={CY}
                            r={EGO_R}
                            fill={nodeColor(egoNode.node_type) ?? NODE_COLOR_FALLBACK}
                            stroke='#fff'
                            strokeWidth={2.5}
                        />
                        <text
                            x={CX}
                            y={CY + EGO_R + 18}
                            textAnchor='middle'
                            fontSize={13}
                            fontFamily='var(--font-mono)'
                            fill='var(--color-text-1)'
                            fontWeight='700'
                        >
                            {egoNode.label.length > 30
                                ? egoNode.label.slice(0, 29) + '…'
                                : egoNode.label}
                        </text>
                        {egoNode.isSeed && (
                            <text
                                x={CX}
                                y={CY + EGO_R + 29}
                                textAnchor='middle'
                                fontSize={9}
                                fontFamily='var(--font-mono)'
                                fill='var(--color-text-3)'
                            >
                                entidade investigada
                            </text>
                        )}
                    </g>

                    {/* Tooltip */}
                    {tooltip &&
                        (() => {
                            const TW = 210;
                            const TH = 80;
                            const PAD_T = 12;
                            let tx = tooltip.svgX + 18;
                            let ty = tooltip.svgY - TH / 2;
                            if (tx + TW > SVG_W - 8) tx = tooltip.svgX - TW - 14;
                            if (ty < 6) ty = 6;
                            if (ty + TH > SVG_H - 6) ty = SVG_H - TH - 6;
                            const typeLabel =
                                NODE_TYPE_LABELS[tooltip.node.node_type] ?? tooltip.node.node_type;
                            const shortLabel =
                                tooltip.node.label.length > 34
                                    ? tooltip.node.label.slice(0, 33) + '…'
                                    : tooltip.node.label;
                            const isEgo = tooltip.node.id === egoId;
                            return (
                                <g pointerEvents='none'>
                                    <rect
                                        x={tx}
                                        y={ty}
                                        width={TW}
                                        height={TH}
                                        rx={6}
                                        fill='#16161E'
                                        stroke='var(--color-border)'
                                        strokeWidth={1}
                                    />
                                    <text
                                        x={tx + PAD_T}
                                        y={ty + 22}
                                        fontSize={11}
                                        fontFamily='var(--font-mono)'
                                        fill='#E8E8F0'
                                        fontWeight='600'
                                    >
                                        {shortLabel}
                                    </text>
                                    <text
                                        x={tx + PAD_T}
                                        y={ty + 38}
                                        fontSize={10}
                                        fontFamily='var(--font-mono)'
                                        fill='#8888A0'
                                    >
                                        {typeLabel}
                                    </text>
                                    <text
                                        x={tx + PAD_T}
                                        y={ty + 54}
                                        fontSize={10}
                                        fontFamily='var(--font-mono)'
                                        fill='#8888A0'
                                    >
                                        {tooltip.degree} conexões totais
                                    </text>
                                    {!isEgo && (
                                        <text
                                            x={tx + PAD_T}
                                            y={ty + 68}
                                            fontSize={9}
                                            fontFamily='var(--font-mono)'
                                            fill='#5CA8FF'
                                        >
                                            clique para explorar →
                                        </text>
                                    )}
                                </g>
                            );
                        })()}

                    {/* Watermark hint */}
                    <text
                        x={SVG_W - 10}
                        y={SVG_H - 10}
                        textAnchor='end'
                        fontSize={10}
                        fontFamily='var(--font-mono)'
                        fill='var(--color-text-3)'
                        opacity={0.4}
                    >
                        clique em qualquer nó para explorá-lo
                    </text>
                </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '2px 2px' }}>
                {(
                    [
                        { type: 'org', label: 'Órgão Público' },
                        { type: 'company', label: 'Empresa' },
                        { type: 'person', label: 'Pessoa' },
                    ] as const
                ).map(({ type, label }) => (
                    <div
                        key={type}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <span
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: nodeColor(type) ?? NODE_COLOR_FALLBACK,
                                display: 'inline-block',
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                fontSize: 11,
                                color: 'var(--color-text-3)',
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            {label}
                        </span>
                    </div>
                ))}
                <span
                    style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        color: 'var(--color-text-3)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    tamanho = nº de conexões
                </span>
            </div>
        </div>
    );
}

export default CaseEgoGraph;
