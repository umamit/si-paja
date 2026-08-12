import { useMemo } from 'react';
import { DrainageSegment } from '@/types';
import { buildNetwork } from '@/lib/hydraulics/build-network';
import { calculateRouting, RoutedSegmentResult } from '@/lib/hydraulics/calculate-routing';

export type EnrichedSegment = DrainageSegment & RoutedSegmentResult & {
  isReversedFlow: boolean;
};

export function useFlowRouting(segments: DrainageSegment[], rainIntensity: number): EnrichedSegment[] {
  return useMemo(() => {
    if (!segments || segments.length === 0) return [];
    
    try {
      const catchmentWidth = typeof window !== 'undefined'
        ? Number(localStorage.getItem('pupr_catchment_width')) || 15
        : 15;
      const graph = buildNetwork(segments);
      const routingResults = calculateRouting(segments, graph, rainIntensity, catchmentWidth);

      return segments.map(seg => {
        const result = routingResults[seg.id] || {
          segmentId: seg.id,
          Q_lokal: 0,
          Q_total: 0,
          Q_max: 0,
          isBottleneck: false,
          slopePercent: 0,
          isAdverseSlope: false,
          isCriticalSlope: false,
        };

        const isReversedFlow = graph.directions[seg.id]?.isReversed ?? false;

        return {
          ...seg,
          ...result,
          isReversedFlow,
        };
      });
    } catch (error) {
      console.error('Error in flow routing calculation:', error);
      return segments.map(seg => ({
        ...seg,
        segmentId: seg.id,
        Q_lokal: 0,
        Q_total: 0,
        Q_max: 0,
        isBottleneck: false,
        slopePercent: 0,
        isAdverseSlope: false,
        isCriticalSlope: false,
        isReversedFlow: false,
      }));

    }
  }, [segments, rainIntensity]);
}
