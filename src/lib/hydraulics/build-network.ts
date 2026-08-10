import { DrainageSegment } from '@/types';

export interface NetworkNode {
  id: string;
  lat: number;
  lng: number;
}

export interface SegmentDirection {
  segmentId: string;
  fromNodeId: string;
  toNodeId: string;
  isReversed: boolean;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  directions: Record<string, SegmentDirection>;
  adjacencyList: Record<string, { incoming: string[]; outgoing: string[] }>;
}

const TOLERANCE = 0.00015; // Jarak toleransi pencocokan ujung parit (~15 meter)

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}

function findOrCreateNode(lat: number, lng: number, nodes: NetworkNode[]): string {
  const existing = nodes.find(n => getDistance(n.lat, n.lng, lat, lng) < TOLERANCE);
  if (existing) return existing.id;
  const newId = `node-${nodes.length + 1}`;
  nodes.push({ id: newId, lat, lng });
  return newId;
}

export function buildNetwork(segments: DrainageSegment[]): NetworkGraph {
  const nodes: NetworkNode[] = [];
  const directions: Record<string, SegmentDirection> = {};
  const adjacencyList: Record<string, { incoming: string[]; outgoing: string[] }> = {};

  // 1. Tentukan arah aliran alami dan id node untuk setiap segmen
  segments.forEach(seg => {
    const elevStart = seg.start_elevation_m ?? 0;
    const elevEnd = seg.end_elevation_m ?? 0;
    const isReversed = elevStart < elevEnd;

    const fromLat = isReversed ? seg.end_lat : seg.start_lat;
    const fromLng = isReversed ? seg.end_lng : seg.start_lng;
    const toLat = isReversed ? seg.start_lat : seg.end_lat;
    const toLng = isReversed ? seg.end_lng : seg.start_lng;

    const fromNodeId = findOrCreateNode(fromLat, fromLng, nodes);
    const toNodeId = findOrCreateNode(toLat, toLng, nodes);

    directions[seg.id] = { segmentId: seg.id, fromNodeId, toNodeId, isReversed };
  });

  // Inisialisasi list ketetanggaan (adjacency) untuk setiap node
  nodes.forEach(node => {
    adjacencyList[node.id] = { incoming: [], outgoing: [] };
  });

  // 2. Hubungkan segmen hulu ke hilir dalam list ketetanggaan
  Object.values(directions).forEach(dir => {
    if (adjacencyList[dir.fromNodeId]) adjacencyList[dir.fromNodeId].outgoing.push(dir.segmentId);
    if (adjacencyList[dir.toNodeId]) adjacencyList[dir.toNodeId].incoming.push(dir.segmentId);
  });

  return { nodes, directions, adjacencyList };
}
