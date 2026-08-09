import { supabase } from '@/lib/supabase/client';
import { AuthResponse } from '@supabase/supabase-js';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  if (isPlaceholder) {
    if (email === 'admin@taliabu.go.id' && password === 'admin123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'pupr_session',
          JSON.stringify({ id: 'local-admin-id', email, role: 'admin', name: 'Admin Taliabu (Local)' })
        );
      }
      return { data: { user: { id: 'local-admin-id' } }, error: null } as unknown as AuthResponse;
    }
    throw new Error('Email atau password salah. Coba: admin@taliabu.go.id / admin123');
  }

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

