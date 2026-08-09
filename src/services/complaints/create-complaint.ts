import { supabase } from '@/lib/supabase/client';
import { PublicComplaint } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export type CreateComplaintInput = Omit<PublicComplaint, 'id' | 'created_at'>;

export async function createComplaint(input: CreateComplaintInput): Promise<PublicComplaint> {
  if (isPlaceholder) {
    const newComplaint: PublicComplaint = {
      ...input,
      id: `local-complaint-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_complaints');
      const complaints: PublicComplaint[] = stored ? JSON.parse(stored) : [];
      complaints.unshift(newComplaint);
      localStorage.setItem('pupr_complaints', JSON.stringify(complaints));
    }
    return newComplaint;
  }

  const { data, error } = await supabase
    .from('public_complaints')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error creating public complaint:', error);
    throw error;
  }

  return data;
}
