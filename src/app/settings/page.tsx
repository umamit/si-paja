'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { AppLayout } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { User, Database, Calculator, Save, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Profile } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [shs, setShs] = useState({ cleaning: '120000', majorRepair: '2200000', minorRepair: '850000' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      if (!p) { router.push('/'); return; }
      setProfile(p);
      setFullName(p.full_name);
    }).catch(console.error).finally(() => setFetching(false));

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_shs');
      if (stored) {
        try { setShs(JSON.parse(stored)); } catch (e) { console.error(e); }
      }
    }
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      if (isPlaceholder) {
        const stored = localStorage.getItem('pupr_session');
        if (stored) {
          const sess = JSON.parse(stored);
          sess.name = fullName;
          localStorage.setItem('pupr_session', JSON.stringify(sess));
        }
      } else {
        const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id);
        if (error) throw error;
      }
      localStorage.setItem('pupr_shs', JSON.stringify(shs));
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      alert('Pengaturan berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan');
    } finally { setLoading(false); }
  };

  if (fetching) return <AppLayout><div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">PENGATURAN</h1>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Kelola Akun, Database, & Standar Harga Satuan (SHS)</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-t-4 border-t-[#ffcc00] border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900"><User className="h-4.5 w-4.5 text-slate-500" />Profil Administrator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-9.5 text-xs bg-slate-50/20" required />
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase">Peran / Hak Akses</label>
                  <div className="h-9.5 flex items-center"><Badge className="bg-[#003366] text-white capitalize text-[10px] py-1 px-2.5 font-bold">{profile?.role}</Badge></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#003366] border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900"><Calculator className="h-4.5 w-4.5 text-slate-500" />Standar Harga Satuan (SHS) Kabupaten Pulau Taliabu</CardTitle>
              <CardDescription className="text-[10px] text-slate-400">Tarif per satuan pengerjaan fisik untuk penentuan otomatis kapasitas anggaran rencana (RAB).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4.5">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase">Normalisasi Sedimen (m³)</label>
                  <Input type="number" value={shs.cleaning} onChange={(e) => setShs({ ...shs, cleaning: e.target.value })} className="h-9.5 text-xs" required />
                </div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase">Rehab Ringan (meter)</label>
                  <Input type="number" value={shs.minorRepair} onChange={(e) => setShs({ ...shs, minorRepair: e.target.value })} className="h-9.5 text-xs" required />
                </div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase">Rehab Total / Baru (meter)</label>
                  <Input type="number" value={shs.majorRepair} onChange={(e) => setShs({ ...shs, majorRepair: e.target.value })} className="h-9.5 text-xs" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-xl bg-slate-50/20">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900"><Database className="h-4 w-4 text-slate-500" />Koneksi & Sistem Supabase</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2 text-slate-600">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100"><span className="font-medium">Status Sinkronisasi</span>
                <Badge className={isPlaceholder ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}>{isPlaceholder ? 'Lokal (Offline Mode)' : 'Terhubung Cloud'}</Badge>
              </div>
              <div className="flex justify-between items-center py-1.5"><span className="font-medium">Host Database</span>
                <span className="font-mono text-[10px] text-slate-500">{isPlaceholder ? 'Browser LocalStorage' : process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-10.5 rounded-xl shadow-md gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />} Simpan Semua Pengaturan
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
