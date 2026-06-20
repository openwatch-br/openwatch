'use client';

import { useMemo } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getDossierTimeline } from '@/lib/api';
import type { DossierTimelineResponse } from '@/lib/types';

import { buildCaseTimeline } from '../helpers/buildCaseTimeline';
import type { CaseTimelineModel } from '../helpers/buildCaseTimeline';

interface UseCaseTimelineResult {
    model: CaseTimelineModel;
    raw: DossierTimelineResponse;
}

/**
 * Suspense-first loader for a case's dossier timeline. Returns the raw payload
 * plus the derived, time-scaled view-model consumed by <CaseTimeline />.
 */
export function useCaseTimeline(caseId: string): UseCaseTimelineResult {
    const { data } = useSuspenseQuery({
        queryKey: ['case-timeline', caseId],
        queryFn: () => getDossierTimeline(caseId),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const model = useMemo(() => buildCaseTimeline(data), [data]);

    return { model, raw: data };
}
