import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

export type CreateSegmentInput = Omit<DrainageSegment, 'id' | 'created_at'>;

export async function createSegment(input: CreateSegmentInput): Promise<DrainageSegment> {
  const { data, error } = await supabase
    .from('drainage_segments')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error creating drainage segment:', error);
    throw error;
  }

  return data;
}
