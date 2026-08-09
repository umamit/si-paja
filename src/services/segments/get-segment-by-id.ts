import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

export async function getSegmentById(id: string): Promise<DrainageSegment | null> {
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
