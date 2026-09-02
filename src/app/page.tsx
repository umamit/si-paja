'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/services/auth/sign-in';
import { getProfile } from '@/services/auth/get-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, ShieldCheck, Building, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile) router.push('/dashboard');
    }).catch(console.error);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090c10] px-4 relative overflow-hidden font-sans">
      {/* Architectural Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Ambient Light Spheres */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Header Logo & Titles */}
      <div className="flex flex-col items-center mb-6 relative z-10">
        <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-emerald-500/30 shadow-xl shadow-emerald-500/5 max-w-[120px] mb-4 transition-transform duration-300 hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sipaja-emblem.png" alt="SI-PAJA Logo" className="w-full h-auto object-contain rounded-xl" />
        </div>
        <h1 className="text-3xl font-black tracking-wider text-white uppercase text-center">
          SI-PAJA
        </h1>
        <p className="text-[10px] font-extrabold tracking-[0.15em] text-emerald-400 uppercase mt-0.5 text-center">
          Sistem Informasi Pemetaan dan Analisis Jaringan Drainase
        </p>
        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-1 text-center">
          Dinas PUPR Kabupaten Pulau Taliabu &bull; Bidang Sumber Daya Air
        </p>
      </div>

      {/* Glassmorphism Container */}
      <div className="w-full max-w-md bg-[#12171d]/85 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl relative z-10 overflow-hidden transition-all duration-300 hover:border-emerald-500/40">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-center gap-2 border-b border-slate-800/80 pb-4">
            <LogIn className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">MASUK AKUN</span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-950/40 border border-rose-800/50 p-3 text-center text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-0.5">ALAMAT EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#0a0e13] border-slate-800/90 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-11 rounded-xl text-xs transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-0.5">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#0a0e13] border-slate-800/90 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-11 rounded-xl text-xs transition-colors"
                  required
                />
              </div>
            </div>

            {/* Emerald Accent Action Button */}
            <Button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-emerald-500/20 mt-2 h-11 uppercase text-xs tracking-wider gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              MASUK KE PORTAL SI-PAJA
            </Button>
          </form>
        </div>
      </div>

      {/* Security & Standard Badges */}
      <div className="flex items-center gap-4 mt-8 relative z-10 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
        <div className="flex items-center gap-1.5 text-emerald-400/90">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Keamanan Terenkripsi</span>
        </div>
        <span className="text-slate-700">&bull;</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Building className="h-3.5 w-3.5 text-slate-400" />
          <span>Standar PUPR</span>
        </div>
      </div>
    </div>
  );
}
