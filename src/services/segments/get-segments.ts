import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function getSegments(): Promise<DrainageSegment[]> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_segments');
      if (stored) {
        return JSON.parse(stored).filter((seg: any) => !seg.id.startsWith('seed-'));
      }
      localStorage.setItem('pupr_segments', JSON.stringify([]));
      return [];
    }
    return [];
  }

  const { data, error } = await supabase
    .from('drainage_segments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching drainage segments:', error);
    throw error;
  }

  return data || [];
}
export default getSegments;
