'use client';

// Flourish-style network graph for a case (Sigma.js + graphology, WebGL).
// Force-directed layout, node size by degree, color by entity type,
// hover-highlight neighbors, node drag, and a category legend that filters.
// Import via next/dynamic with ssr:false — Sigma touches window.

import React, { useEffect, useMemo, useRef, useState } from 'react';

import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FA2LayoutSupervisor from 'graphology-layout-forceatlas2/worker';
import Sigma from 'sigma';

import { useCaseGraph } from '@/hooks/useCaseGraph';
import { NODE_COLOR_FALLBACK, edgeColor, edgeSize, nodeColor } from '@/components/graph/graphStyle';

const TYPE_LABEL: Record<string, string> = {
    person: 'Pessoa',
    company: 'Empresa',
    empresa: 'Empresa',
    org: 'Órgão',
    orgao: 'Órgão',
};

/** Degree → node radius (sqrt scale keeps hubs readable without dominating). */
function nodeSizeForDegree(degree: number, isSeed: boolean): number {
    const base = 6 + Math.sqrt(degree) * 3;
    return Math.min(24, isSeed ? Math.max(base, 11) : base);
}

const FADED = '#26262C';

interface CaseNetworkGraphProps {
    caseId: string;
    focusSignalId?: string;
}

/** Self-contained case network graph with Flourish-style interactivity. */
export const CaseNetworkGraph: React.FC<CaseNetworkGraphProps> = ({ caseId, focusSignalId }) => {
    const { graphData, degreeMap, erPending } = useCaseGraph(caseId, focusSignalId);

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

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        const graph = new Graph({ multi: true });
        const order = graphData.nodes.length;
        graphData.nodes.forEach((n, i) => {
            graph.addNode(n.id, {
                label: n.label,
                size: nodeSizeForDegree(degreeMap[n.id] ?? 0, n.isSeed),
                color: nodeColor(n.node_type),
                nodeType: n.node_type,
                x: Math.cos((2 * Math.PI * i) / Math.max(order, 1)),
                y: Math.sin((2 * Math.PI * i) / Math.max(order, 1)),
            });
        });
        for (const l of graphData.links) {
            if (graph.hasNode(l.source) && graph.hasNode(l.target) && !graph.hasEdge(l.id)) {
                graph.addEdgeWithKey(l.id, l.source, l.target, {
                    label: l.type,
                    size: edgeSize(l.edge_strength ?? 'weak', l.weight),
                    color: edgeColor(l.type),
                });
            }
        }

        const settings = forceAtlas2.inferSettings(graph);
        const supervisor = new FA2LayoutSupervisor(graph, { settings });

        const renderer = new Sigma(graph, container, {
            // Container may be 0-width mid route-transition; Sigma renders once it gains size.
            allowInvalidContainer: true,
            renderEdgeLabels: false,
            labelColor: { color: '#B9B9C0' },
            labelFont: 'Inter, sans-serif',
            labelSize: 11,
            defaultEdgeType: 'line',
            zIndex: true,
            nodeReducer: (node, data) => {
                const res = { ...data };
                if (hiddenTypesRef.current.has(String(data['nodeType']))) {
                    res.hidden = true;
                    return res;
                }
                const hovered = hoveredRef.current;
                if (hovered && node !== hovered && !graph.areNeighbors(node, hovered)) {
                    res.color = FADED;
                    res.label = '';
                }
                return res;
            },
            edgeReducer: (edge, data) => {
                const res = { ...data };
                const hovered = hoveredRef.current;
                if (hovered && !graph.extremities(edge).includes(hovered)) {
                    res.hidden = true;
                }
                const [s, t] = graph.extremities(edge);
                if (
                    hiddenTypesRef.current.has(String(graph.getNodeAttribute(s, 'nodeType'))) ||
                    hiddenTypesRef.current.has(String(graph.getNodeAttribute(t, 'nodeType')))
                ) {
                    res.hidden = true;
                }
                return res;
            },
        });
        sigmaRef.current = renderer;

        // Hover-highlight neighbors
        renderer.on('enterNode', ({ node }) => {
            hoveredRef.current = node;
            container.style.cursor = 'grab';
            renderer.refresh();
        });
        renderer.on('leaveNode', () => {
            hoveredRef.current = null;
            container.style.cursor = 'default';
            renderer.refresh();
        });

        // Node drag
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
        const release = () => {
            if (dragged) graph.removeNodeAttribute(dragged, 'highlighted');
            dragged = null;
            container.style.cursor = 'default';
        };
        mouse.on('mouseup', release);

        supervisor.start();
        const stopTimer = setTimeout(() => supervisor.stop(), 3000);

        return () => {
            clearTimeout(stopTimer);
            supervisor.kill();
            renderer.kill();
            sigmaRef.current = null;
            hoveredRef.current = null;
        };
    }, [graphData, degreeMap]);

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Legend (category filter) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {presentTypes.map((type) => {
                    const off = hiddenTypes.has(type);
                    return (
                        <button
                            key={type}
                            type="button"
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
                                    background: nodeColor(type) ?? NODE_COLOR_FALLBACK,
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
                    arraste os nós · passe o mouse para destacar vínculos
                </span>
            </div>

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
        </div>
    );
};

export default CaseNetworkGraph;
