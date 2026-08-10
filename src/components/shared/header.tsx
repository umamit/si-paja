'use client';

import { useEffect, useState } from 'react';
import { getProfile } from '@/services/auth/get-profile';
import { Profile } from '@/types';
import { User, Calendar, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function Header() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
  }, []);

  const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3 text-slate-500 text-[10px] md:text-sm">
        <div className="flex items-center space-x-1.5">
          <Calendar className="h-4 w-4 text-[#ffcc00]" />
          <span className="hidden xs:inline">{formatDate()}</span>
        </div>
        <span className="text-slate-300 hidden md:inline">|</span>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border shrink-0 ${
          isSupabaseConfigured 
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' 
            : 'bg-amber-50/50 border-amber-250 text-amber-700'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
            isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
          <Database className="h-3 w-3" />
          <span>{isSupabaseConfigured ? 'Cloud DB' : 'Offline'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            {profile?.full_name || 'Surveyor PUPR'}
          </p>
          <p className="text-[10px] text-slate-500 capitalize">
            {profile?.role || 'Pengguna'}
          </p>
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <User className="h-4.5 w-4.5 text-slate-600" />
        </div>
      </div>
    </header>
  );
}
