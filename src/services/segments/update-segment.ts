import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';
import { CreateSegmentInput } from './create-segment';

export async function updateSegment(
  id: string,
  input: Partial<CreateSegmentInput>
): Promise<DrainageSegment> {
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
