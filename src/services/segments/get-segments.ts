import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

export async function getSegments(): Promise<DrainageSegment[]> {
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
