import { supabase } from '@/lib/supabase/client';

export async function deleteSegment(id: string): Promise<boolean> {
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
