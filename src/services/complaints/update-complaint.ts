import { supabase } from '@/lib/supabase/client';
import { PublicComplaint } from '@/types';
import { CreateComplaintInput } from './create-complaint';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function updateComplaint(
  id: string,
  input: Partial<CreateComplaintInput>
): Promise<PublicComplaint> {
  if (isPlaceholder) {
    let updated: PublicComplaint | null = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_complaints');
      if (stored) {
        const complaints: PublicComplaint[] = JSON.parse(stored);
        const idx = complaints.findIndex((c) => c.id === id);
        if (idx !== -1) {
          complaints[idx] = { ...complaints[idx], ...input } as PublicComplaint;
          updated = complaints[idx];
          localStorage.setItem('pupr_complaints', JSON.stringify(complaints));
        }
      }
    }
    if (!updated) throw new Error('Complaint not found locally');
    return updated;
  }

  const { data, error } = await supabase
    .from('public_complaints')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating public complaint:', error);
    throw error;
  }

  return data;
}
