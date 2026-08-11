import { supabase } from '@/lib/supabase/client';

export interface BackfillResult {
  total: number;
  updated: number;
  skipped: number;
  failed: number;
}

export async function backfillElevation(
  onProgress: (current: number, total: number, name: string) => void
): Promise<BackfillResult> {
  const { data: segments, error } = await supabase
    .from('drainage_segments')
    .select('id, name, start_lat, start_lng, end_lat, end_lng, start_elevation_m, end_elevation_m');

  if (error) throw error;
  if (!segments || segments.length === 0) return { total: 0, updated: 0, skipped: 0, failed: 0 };

  const result: BackfillResult = { total: segments.length, updated: 0, skipped: 0, failed: 0 };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    onProgress(i + 1, segments.length, seg.name || seg.id);

    try {
      const [startRes, endRes] = await Promise.all([
        fetch(`/api/elevation?lat=${seg.start_lat}&lng=${seg.start_lng}`),
        fetch(`/api/elevation?lat=${seg.end_lat}&lng=${seg.end_lng}`),
      ]);

      if (!startRes.ok || !endRes.ok) { result.failed++; continue; }

      const startData = await startRes.json();
      const endData = await endRes.json();
      const startElev: number = startData.elevation || 0;
      const endElev: number = endData.elevation || 0;

      if (startElev === 0 && endElev === 0) { result.skipped++; continue; }

      const { error: updateError } = await supabase
        .from('drainage_segments')
        .update({ start_elevation_m: startElev, end_elevation_m: endElev })
        .eq('id', seg.id);

      if (updateError) { result.failed++; } else { result.updated++; }
    } catch {
      result.failed++;
    }
  }

  return result;
}
