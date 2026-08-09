import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function getProfile(): Promise<Profile | null> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('pupr_session');
      if (session) {
        const parsed = JSON.parse(session);
        return {
          id: parsed.id,
          full_name: parsed.name,
          role: parsed.role,
          created_at: new Date().toISOString(),
        };
      }
    }
    return null;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

