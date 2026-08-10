import { supabase } from '@/lib/supabase/client';
import { PublicComplaint } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function getComplaints(): Promise<PublicComplaint[]> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_complaints');
      if (stored) {
        return JSON.parse(stored).filter((c: any) => !c.id.startsWith('complaint-seed-'));
      }
      localStorage.setItem('pupr_complaints', JSON.stringify([]));
      return [];
    }
    return [];
  }

  const { data, error } = await supabase
    .from('public_complaints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public complaints:', error);
    throw error;
  }

  return data || [];
}
export default getComplaints;
