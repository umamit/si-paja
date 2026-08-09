import { supabase } from '@/lib/supabase/client';

export async function signOut(): Promise<boolean> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error during sign out:', error.message);
    throw error;
  }

  return true;
}
