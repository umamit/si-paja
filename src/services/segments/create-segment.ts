import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export type CreateSegmentInput = Omit<DrainageSegment, 'id' | 'created_at'>;

export async function createSegment(input: CreateSegmentInput): Promise<DrainageSegment> {
  if (isPlaceholder) {
    const newSeg: DrainageSegment = {
      ...input,
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_segments');
      const segments: DrainageSegment[] = stored ? JSON.parse(stored) : [];
      segments.unshift(newSeg);
      localStorage.setItem('pupr_segments', JSON.stringify(segments));
    }
    return newSeg;
  }

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

