'use client';

// Case network graph — three view modes:
//   "ego"    : SVG radial ego network (ICIJ pattern — default, best for laypeople)
//   "chrono" : SVG timeline positioned by first event date per entity
//   "force"  : Sigma.js + ForceAtlas2 (WebGL, node drag, category filter)
// Import via next/dynamic with ssr:false — Sigma touches window.

import React, { useEffect, useMemo, useRef, useState } from 'react';

import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FA2LayoutSupervisor from 'graphology-layout-forceatlas2/worker';
import Sigma from 'sigma';

import {
    CANVAS_THEME,
    EDGE_STYLE,
    GRAPH_THEME,
    entityCssVar,
    makeEdgeReducer,
    makeNodeReducer,
    mapEdgeType,
    nodeSizeForDegree,
    normalizeEntityType,
    type InteractionCtx,
} from '@/components/graph/graphStyle';
import { DashedEdgeProgram } from '@/components/graph/dashedEdgeProgram';
import { useCaseGraph } from '@/hooks/useCaseGraph';
import type { DossierTimelineResponse } from '@/lib/types';
import { CaseChronologicGraph } from './CaseChronologicGraph';
import { CaseEgoGraph } from './CaseEgoGraph';

const TYPE_LABEL: Record<string, string> = {
    person: 'Pessoa',
    company: 'Empresa',
    empresa: 'Empresa',
    org: 'Órgão',
    orgao: 'Órgão',
};

type ViewMode = 'ego' | 'chrono' | 'force';

interface CaseNetworkGraphProps {
    caseId: string;
    focusSignalId?: string;
    /** Raw dossier timeline — enables the chronological view mode. */
    timelineRaw?: DossierTimelineResponse;
}

/** Self-contained case network graph with two view modes. */
export const CaseNetworkGraph: React.FC<CaseNetworkGraphProps> = ({ caseId, focusSignalId, timelineRaw }) => {
    const { graphData, degreeMap, erPending } = useCaseGraph(caseId, focusSignalId);

    const [viewMode, setViewMode] = useState<ViewMode>('ego');

    const containerRef = useRef<HTMLDivElement | null>(null);
    const sigmaRef = useRef<Sigma | null>(null);
    const hoveredRef = useRef<string | null>(null);
    const hiddenTypesRef = useRef<Set<string>>(new Set());

    const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

    /** Distinct entity types present (drives the legend). */
    const presentTypes = useMemo(() => {
        const seen = new Set<string>();
        for (const n of graphData.nodes) seen.add(n.node_type);
        return Array.from(seen);
    }, [graphData.nodes]);

    useEffect(() => {
        hiddenTypesRef.current = hiddenTypes;
        sigmaRef.current?.refresh();
    }, [hiddenTypes]);

    // Force-directed Sigma.js graph — only active when viewMode === 'force'
    useEffect(() => {
        if (viewMode !== 'force') return undefined;
        const container = containerRef.current;
        if (!container) return undefined;

        const theme = GRAPH_THEME[CANVAS_THEME];
        const graph = new Graph({ multi: true });
        const order = graphData.nodes.length;
        graphData.nodes.forEach((n, i) => {
            const entityType = normalizeEntityType(n.node_type);
            graph.addNode(n.id, {
                label: n.label,
                entityType,
                isEgo: n.isSeed,
                degree: degreeMap[n.id] ?? 0,
                size: nodeSizeForDegree(degreeMap[n.id] ?? 0, n.isSeed),
                color: theme.node[entityType],
                nodeType: n.node_type,
                x: Math.cos((2 * Math.PI * i) / Math.max(order, 1)),
                y: Math.sin((2 * Math.PI * i) / Math.max(order, 1)),
            });
        });
        for (const l of graphData.links) {
            if (graph.hasNode(l.source) && graph.hasNode(l.target) && !graph.hasEdge(l.id)) {
                const semantic = mapEdgeType(l.type);
                graph.addEdgeWithKey(l.id, l.source, l.target, {
                    label: l.type,
                    semantic,
                    size: EDGE_STYLE[semantic].size,
                    type: EDGE_STYLE[semantic].dashed ? 'dashed' : 'line',
                    color: theme.edge[semantic],
                });
            }
        }

        const settings = forceAtlas2.inferSettings(graph);
        const supervisor = new FA2LayoutSupervisor(graph, { settings });

        // Interação partilhada (hover/seleção esmaece a vizinhança fora de foco).
        const ctx: InteractionCtx = {};
        const baseNodeReducer = makeNodeReducer(CANVAS_THEME, ctx);
        const baseEdgeReducer = makeEdgeReducer(CANVAS_THEME, ctx);

        const renderer = new Sigma(graph, container, {
            allowInvalidContainer: true,
            renderEdgeLabels: false,
            labelColor: { color: theme.label },
            labelFont: 'Red Hat Mono, ui-monospace, monospace',
            labelSize: 11,
            defaultEdgeType: 'line',
            edgeProgramClasses: { dashed: DashedEdgeProgram },
            zIndex: true,
            // Reducers partilhados + filtro por tipo de entidade (legenda).
            nodeReducer: (node, data) => {
                if (hiddenTypesRef.current.has(String(data['nodeType']))) {
                    return { ...data, hidden: true };
                }
                return baseNodeReducer(node, data);
            },
            edgeReducer: (edge, data) => {
                const [s, t] = graph.extremities(edge);
                if (
                    hiddenTypesRef.current.has(String(graph.getNodeAttribute(s, 'nodeType'))) ||
                    hiddenTypesRef.current.has(String(graph.getNodeAttribute(t, 'nodeType')))
                ) {
                    return { ...data, hidden: true };
                }
                return baseEdgeReducer(edge, data, s, t);
            },
        });
        sigmaRef.current = renderer;

        const focusOn = (node: string | null): void => {
            if (!node || !graph.hasNode(node)) {
                ctx.focusNeighborhood = undefined;
                return;
            }
            const set = new Set<string>([node]);
            graph.forEachNeighbor(node, nb => set.add(nb));
            ctx.focusNeighborhood = set;
        };

        renderer.on('enterNode', ({ node }) => {
            hoveredRef.current = node;
            ctx.hoveredNode = node;
            focusOn(node);
            container.style.cursor = 'grab';
            renderer.refresh();
        });
        renderer.on('leaveNode', () => {
            hoveredRef.current = null;
            ctx.hoveredNode = undefined;
            focusOn(null);
            container.style.cursor = 'default';
            renderer.refresh();
        });

        let dragged: string | null = null;
        renderer.on('downNode', ({ node }) => {
            dragged = node;
            graph.setNodeAttribute(node, 'highlighted', true);
            container.style.cursor = 'grabbing';
        });
        const mouse = renderer.getMouseCaptor();
        mouse.on('mousemovebody', (e) => {
            if (!dragged) return;
            const pos = renderer.viewportToGraph(e);
            graph.setNodeAttribute(dragged, 'x', pos.x);
            graph.setNodeAttribute(dragged, 'y', pos.y);
            e.preventSigmaDefault();
            e.original.preventDefault();
            e.original.stopPropagation();
        });
        const release = (): void => {
            if (dragged) graph.removeNodeAttribute(dragged, 'highlighted');
            dragged = null;
            container.style.cursor = 'default';
        };
        mouse.on('mouseup', release);

        supervisor.start();
        const stopTimer = setTimeout(() => supervisor.stop(), 4000);

        return () => {
            clearTimeout(stopTimer);
            supervisor.kill();
            renderer.kill();
            sigmaRef.current = null;
            hoveredRef.current = null;
        };
    }, [graphData, degreeMap, viewMode]);

    function toggleType(type: string): void {
        setHiddenTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    }

    if (graphData.nodes.length === 0) {
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
                {erPending
                    ? 'Resolução de entidades em processamento — a rede ainda não foi materializada.'
                    : 'Nenhum vínculo materializado para este caso.'}
            </div>
        );
    }

    const canChrono = timelineRaw !== undefined;

    const VIEW_TABS: Array<{ id: ViewMode; label: string; available: boolean }> = [
        { id: 'ego', label: 'Radar', available: true },
        { id: 'chrono', label: 'Cronológico', available: canChrono },
        { id: 'force', label: 'Força', available: true },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* View mode toggle */}
                <div
                    style={{
                        display: 'inline-flex',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                    }}
                >
                    {VIEW_TABS.filter(t => t.available).map((tab, i, arr) => (
                        <button
                            key={tab.id}
                            type='button'
                            onClick={() => setViewMode(tab.id)}
                            style={{
                                fontSize: 11,
                                fontFamily: 'var(--font-mono)',
                                padding: '4px 12px',
                                background:
                                    viewMode === tab.id
                                        ? 'var(--color-brand)'
                                        : 'var(--color-surface)',
                                color: viewMode === tab.id ? 'var(--color-brand-ink)' : 'var(--color-text-2)',
                                border: 'none',
                                cursor: 'pointer',
                                borderRight:
                                    i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Type filter legend (force mode only) */}
                {viewMode === 'force' &&
                    presentTypes.map(type => {
                        const off = hiddenTypes.has(type);
                        return (
                            <button
                                key={type}
                                type='button'
                                onClick={() => toggleType(type)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 12,
                                    fontFamily: 'var(--font-mono)',
                                    color: off ? 'var(--color-text-3)' : 'var(--color-text-2)',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '3px 10px',
                                    cursor: 'pointer',
                                    opacity: off ? 0.5 : 1,
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: entityCssVar(type),
                                    }}
                                />
                                {TYPE_LABEL[type] ?? type}
                            </button>
                        );
                    })}

                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--color-text-3)',
                        fontFamily: 'var(--font-mono)',
                        marginLeft: 'auto',
                    }}
                >
                    {viewMode === 'ego' && 'clique nos nós para explorar · centro = entidade investigada'}
                    {viewMode === 'chrono' && 'eixo X = data · lanes = tipo de entidade'}
                    {viewMode === 'force' && 'arraste os nós · passe o mouse para destacar vínculos'}
                </span>
            </div>

            {/* Views */}
            {viewMode === 'ego' && (
                <CaseEgoGraph
                    nodes={graphData.nodes}
                    links={graphData.links}
                    degreeMap={degreeMap}
                />
            )}
            {viewMode === 'chrono' && timelineRaw && (
                <CaseChronologicGraph
                    nodes={graphData.nodes}
                    links={graphData.links}
                    degreeMap={degreeMap}
                    timelineRaw={timelineRaw}
                />
            )}
            {viewMode === 'force' && (
                <div
                    ref={containerRef}
                    style={{
                        height: 560,
                        width: '100%',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
            )}
        </div>
    );
};

export default CaseNetworkGraph;
