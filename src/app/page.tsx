'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/services/auth/sign-in';
import { getProfile } from '@/services/auth/get-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030d1c] px-4 relative overflow-hidden">
      {/* Premium Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ffcc00]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 border-t-4 border-t-[#ffcc00] p-10 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-emerald-500/5">
        <div className="flex flex-col items-center mb-8">
          {/* Logo container wrapper for high visibility */}
          <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-100 max-w-[200px] mb-4 hover:scale-105 transition-transform duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-pupr.png" alt="PUPR Logo" className="w-full h-auto object-contain" />
          </div>
          <h2 className="text-center text-xl font-extrabold tracking-tight text-white uppercase">
            SIG-Drainase Bobong
          </h2>
          <p className="mt-1 text-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Dinas Pekerjaan Umum & Penataan Ruang Taliabu
          </p>
        </div>

        <form className="space-y-4.5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-rose-950/30 border border-rose-800/40 p-3 text-center text-xs text-rose-450 animate-bounce">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Email Surveyor</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
              <Input
                type="email"
                placeholder="Masukkan email Dinas..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 bg-slate-950/70 border-slate-800 text-white placeholder-slate-600 focus:border-[#ffcc00] focus:ring-[#ffcc00]/20 h-10.5 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 bg-slate-950/70 border-slate-800 text-white placeholder-slate-655 focus:border-[#ffcc00] focus:ring-[#ffcc00]/20 h-10.5 rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#ffcc00] hover:bg-[#e6b800] text-slate-950 font-extrabold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#ffcc00]/10 mt-6 h-11 uppercase text-xs tracking-wider"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Masuk Portal SIG
          </Button>
        </form>
      </div>

      {/* Footer Branding */}
      <p className="absolute bottom-6 text-[10px] text-slate-500 tracking-wide uppercase">
        Bidang Sumber Daya Air &bull; Kabupaten Taliabu
      </p>
    </div>
  );
}
