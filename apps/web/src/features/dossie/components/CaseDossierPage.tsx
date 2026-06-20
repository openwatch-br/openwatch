'use client';

import React, { Suspense } from 'react';

import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';

import { useCaseTimeline } from '../hooks/useCaseTimeline';
import { CaseTimeline } from './CaseTimeline';
import { CaseTimelineHeader } from './CaseTimelineHeader';

// Sigma touches window — load the network graph client-only.
const CaseNetworkGraph = dynamic(() => import('./CaseNetworkGraph'), {
    ssr: false,
    loading: () => <GraphFallback />,
});

function GraphFallback(): React.ReactElement {
    return (
        <div
            style={{
                height: 560,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-3)',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
            }}
        >
            Carregando rede…
        </div>
    );
}

/** Case detail entry: a Flourish-style timeline with a network sub-view. */
export default function CaseDossierPage(): React.ReactElement {
    const params = useParams();
    const searchParams = useSearchParams();
    const caseId = String(params['caseId'] ?? '');
    const { model, raw } = useCaseTimeline(caseId);
    const view = searchParams.get('tab') === 'rede' ? 'rede' : 'cronologia';

    return (
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px 64px' }}>
            <CaseTimelineHeader model={model} eventCount={model.items.length} />

            {view === 'cronologia' ? (
                <CaseTimeline model={model} />
            ) : (
                <Suspense fallback={<GraphFallback />}>
                    <CaseNetworkGraph caseId={caseId} timelineRaw={raw} />
                </Suspense>
            )}
        </div>
    );
}
