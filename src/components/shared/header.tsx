'use client';

import { useEffect, useState } from 'react';
import { getProfile } from '@/services/auth/get-profile';
import { Profile } from '@/types';
import { User, Calendar } from 'lucide-react';

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
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-2 text-slate-500 text-sm">
        <Calendar className="h-4 w-4 text-emerald-600" />
        <span>{formatDate()}</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            {profile?.full_name || 'Surveyor PUPR'}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {profile?.role || 'Pengguna'}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <User className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </header>
  );
}
