import { supabase } from '@/lib/supabase/client';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function signOut(): Promise<boolean> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pupr_session');
    }
    return true;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error during sign out:', error.message);
    throw error;
  }

  return true;
}

