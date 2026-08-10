import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';
import { CreateSegmentInput } from './create-segment';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function updateSegment(
  id: string,
  input: Partial<CreateSegmentInput>
): Promise<DrainageSegment> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_segments');
      const segments: DrainageSegment[] = stored ? JSON.parse(stored) : [];
      const idx = segments.findIndex((s) => s.id === id);
      if (idx !== -1) {
        const updated = { ...segments[idx], ...input } as DrainageSegment;
        segments[idx] = updated;
        localStorage.setItem('pupr_segments', JSON.stringify(segments));
        return updated;
      }
    }
    throw new Error('Segment tidak ditemukan di penyimpanan lokal');
  }

  const { data, error } = await supabase
    .from('drainage_segments')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating drainage segment:', error);
    throw error;
  }

  return data;
}
export default updateSegment;
