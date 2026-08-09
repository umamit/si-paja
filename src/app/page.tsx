'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/services/auth/sign-in';
import { getProfile } from '@/services/auth/get-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already authenticated
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Droplets className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
            SIG-Drainase Bobong
          </h2>
          <p className="mt-1 text-center text-xs text-slate-400">
            Sistem Informasi Geografis &bull; Dinas PUPR Pulau Taliabu
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-rose-950/20 border border-rose-800/30 p-3 text-center text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <Input
              type="email"
              placeholder="Email surveyor"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 bg-slate-950/50 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 bg-slate-950/50 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-all duration-200 mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Masuk Aplikasi
          </Button>
        </form>
      </div>
    </div>
  );
}
