import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function deleteSegment(id: string): Promise<boolean> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_segments');
      if (stored) {
        const segments: DrainageSegment[] = JSON.parse(stored);
        const filtered = segments.filter((seg) => seg.id !== id);
        localStorage.setItem('pupr_segments', JSON.stringify(filtered));
      }
    }
    return true;
  }

  const { error } = await supabase
    .from('drainage_segments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting drainage segment:', error);
    throw error;
  }

  return true;
}

