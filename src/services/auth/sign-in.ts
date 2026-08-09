import { supabase } from '@/lib/supabase/client';
import { AuthResponse } from '@supabase/supabase-js';

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (response.error) {
    console.error('Error during sign in:', response.error.message);
    throw response.error;
  }

  return response;
}
