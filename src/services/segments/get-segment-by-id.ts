import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function getSegmentById(id: string): Promise<DrainageSegment | null> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_segments');
      if (stored) {
        const segments: DrainageSegment[] = JSON.parse(stored);
        return segments.find((seg) => seg.id === id) || null;
      }
    }
    return null;
  }

  const { data, error } = await supabase
    .from('drainage_segments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching drainage segment details:', error);
    throw error;
  }

  return data;
}

