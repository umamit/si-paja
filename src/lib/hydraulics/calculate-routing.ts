import { DrainageSegment } from '@/types';
import { NetworkGraph } from './build-network';

export interface RoutedSegmentResult {
  segmentId: string;
  Q_lokal: number;
  Q_total: number;
  Q_max: number;
  isBottleneck: boolean;
  slopePercent: number;
  isAdverseSlope: boolean;
  isCriticalSlope: boolean;
}

const RUNOFF_COEFFS: Record<string, number> = {
  beton_precast: 0.85,
  pasangan_batu: 0.75,
  tanah: 0.50,
  belum_ada: 0.90,
  lainnya: 0.70,
};

export function calculateRouting(
  segments: DrainageSegment[],
  graph: NetworkGraph,
  rainIntensity: number
): Record<string, RoutedSegmentResult> {
  const { adjacencyList, directions } = graph;
  const results: Record<string, RoutedSegmentResult> = {};

  // 1. Hitung Q_lokal, Q_max, dan kemiringan (slope) untuk setiap segmen
  const Q_lokal_map: Record<string, number> = {};
  const Q_max_map: Record<string, number> = {};
  const slope_map: Record<string, { percent: number; adverse: boolean; critical: boolean }> = {};

  segments.forEach(seg => {
    // Q_lokal = 0.278 * C * I * A
    const C = RUNOFF_COEFFS[seg.material] || 0.7;
    const catchmentArea = (seg.length_m * 15) / 1000000; // Lebar tangkapan diasumsikan 15m
    const Q_lokal = 0.278 * C * rainIntensity * catchmentArea;
    Q_lokal_map[seg.id] = Q_lokal;

    // Q_max = V * B * H
    const B = seg.width_cm / 100;
    const H = seg.depth_cm / 100;
    const V = 0.85; // Kecepatan aliran rata-rata
    Q_max_map[seg.id] = V * B * H;

    // Topografi & Elevasi
    const elevStart = seg.start_elevation_m ?? 0;
    const elevEnd = seg.end_elevation_m ?? 0;
    const dElev = elevStart - elevEnd;
    const slopePercent = seg.length_m > 0 ? (Math.abs(dElev) / seg.length_m) * 100 : 0;

    slope_map[seg.id] = {
      percent: slopePercent,
      adverse: dElev < 0, // Aliran terbalik
      critical: slopePercent < 0.1 && seg.length_m > 0, // Terlalu datar
    };
  });

  // 2. Lakukan penelusuran aliran (Flow Routing)
  const Q_inflow_node: Record<string, number> = {};
  const pendingIncoming: Record<string, number> = {};
  const resolvedSegments = new Set<string>();

  // Inisialisasi node inflow dan counter
  graph.nodes.forEach(node => {
    Q_inflow_node[node.id] = 0;
    pendingIncoming[node.id] = adjacencyList[node.id].incoming.length;
  });

  // Cari node awal (hulu) yang tidak memiliki segmen masuk
  const queue: string[] = [];
  graph.nodes.forEach(node => {
    if (pendingIncoming[node.id] === 0) {
      adjacencyList[node.id].outgoing.forEach(segId => queue.push(segId));
    }
  });

  // Jalankan penelusuran aliran
  let safetyCounter = 0;
  const maxIterations = segments.length * 2;

  while (queue.length > 0 && safetyCounter++ < maxIterations) {
    const segId = queue.shift()!;
    if (resolvedSegments.has(segId)) continue;

    const dir = directions[segId];
    if (!dir) continue;

    // Q_total = Q_masuk_dari_hulu + Q_lokal
    const Q_inflow = Q_inflow_node[dir.fromNodeId] || 0;
    const Q_total = Q_inflow + Q_lokal_map[segId];

    resolvedSegments.add(segId);

    // Salurkan debit ke node hilir
    const toNodeId = dir.toNodeId;
    const outSegs = adjacencyList[toNodeId]?.outgoing || [];
    const splitFactor = outSegs.length > 0 ? outSegs.length : 1;

    // Tambahkan kontribusi debit ke node tujuan
    Q_inflow_node[toNodeId] = (Q_inflow_node[toNodeId] || 0) + (Q_total / splitFactor);

    // Kurangi hitungan input yang tertunda untuk node hilir
    if (pendingIncoming[toNodeId] > 0) {
      pendingIncoming[toNodeId]--;
      if (pendingIncoming[toNodeId] === 0) {
        outSegs.forEach(outId => {
          if (!resolvedSegments.has(outId)) queue.push(outId);
        });
      }
    }

    results[segId] = {
      segmentId: segId,
      Q_lokal: Q_lokal_map[segId],
      Q_total,
      Q_max: Q_max_map[segId],
      isBottleneck: Q_total > Q_max_map[segId],
      slopePercent: slope_map[segId].percent,
      isAdverseSlope: slope_map[segId].adverse,
      isCriticalSlope: slope_map[segId].critical,
    };
  }

  // 3. Fallback untuk segmen terisolasi atau siklus yang terlewat
  segments.forEach(seg => {
    if (!resolvedSegments.has(seg.id)) {
      const Q_total = Q_lokal_map[seg.id];
      results[seg.id] = {
        segmentId: seg.id,
        Q_lokal: Q_lokal_map[seg.id],
        Q_total,
        Q_max: Q_max_map[seg.id],
        isBottleneck: Q_total > Q_max_map[seg.id],
        slopePercent: slope_map[seg.id].percent,
        isAdverseSlope: slope_map[seg.id].adverse,
        isCriticalSlope: slope_map[seg.id].critical,
      };
    }
  });

  return results;
}
