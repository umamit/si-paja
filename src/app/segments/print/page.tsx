'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getSegments } from '@/services/segments/get-segments';
import { DrainageSegment } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PrintReportPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<DrainageSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((prof) => {
        if (!prof) {
          router.push('/');
          return;
        }
        return getSegments();
      })
      .then((data) => {
        if (data) {
          setSegments(data);
          // Auto-trigger print dialog after render
          setTimeout(() => {
            if (typeof window !== 'undefined') window.print();
          }, 800);
        }
      })
      .catch((err) => {
        console.error(err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const [rates, setRates] = useState({ cleaning: 120000, majorRepair: 2200000, minorRepair: 850000 });
  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('pupr_shs');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setRates({ cleaning: Number(p.cleaning) || 120000, majorRepair: Number(p.majorRepair) || 2200000, minorRepair: Number(p.minorRepair) || 850000 });
      } catch (e) {}
    }
  }, []);
  const totalLength = segments.reduce((sum, seg) => sum + Number(seg.length_m), 0);
  const calculateRAB = (seg: DrainageSegment) => {
    const vol = Number(seg.length_m) * (Number(seg.width_cm) / 100) * (Number(seg.depth_cm) / 100);
    if (seg.condition === 'tersumbat') return vol * rates.cleaning;
    if (seg.condition === 'rusak_berat') return Number(seg.length_m) * rates.majorRepair;
    if (seg.condition === 'rusak_ringan') return Number(seg.length_m) * rates.minorRepair;
    return 0;
  };
  const totalRAB = segments.reduce((sum, seg) => sum + calculateRAB(seg), 0);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-8 text-slate-800 font-serif max-w-4xl mx-auto">
      {/* Back button (hidden during print) */}
      <div className="mb-6 print:hidden">
        <Button onClick={() => router.back()} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />Kembali ke Aplikasi
        </Button>
      </div>

      {/* Kop Surat Resmi Dinas PUPR */}
      <div className="flex items-center justify-center border-b-4 border-double border-slate-900 pb-4 mb-6 gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-pupr.png" alt="Logo PUPR" className="h-16 w-auto object-contain shrink-0" />
        <div className="text-center">
          <h2 className="text-lg font-bold uppercase tracking-wide">Pemerintah Kabupaten Pulau Taliabu</h2>
          <h1 className="text-xl font-extrabold uppercase tracking-wide mt-0.5">Dinas Pekerjaan Umum dan Penataan Ruang</h1>
          <p className="text-[10px] italic text-slate-500 mt-0.5">
            Alamat: Jalan Jalur Dua, Bobong, Pulau Taliabu, Maluku Utara &bull; Email: pupr@taliabukab.go.id
          </p>
        </div>
      </div>

      {/* Judul Laporan */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold uppercase underline">Laporan Inventarisasi & Kondisi Jaringan Drainase</h3>
        <p className="text-sm text-slate-500 mt-1">Wilayah Pemetaan: Kota Bobong dan Sekitarnya</p>
      </div>

      {/* Tabel Data Drainase */}
      <table className="w-full border-collapse border border-slate-400 text-xs">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-400 p-2">No</th>
            <th className="border border-slate-400 p-2 text-left">Nama Segmen</th>
            <th className="border border-slate-400 p-2">Panjang (m)</th>
            <th className="border border-slate-400 p-2">Dimensi (L x D) cm</th>
            <th className="border border-slate-400 p-2">Material</th>
            <th className="border border-slate-400 p-2">Kondisi</th>
            <th className="border border-slate-400 p-2 text-right">Estimasi RAB (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, i) => (
            <tr key={seg.id} className="hover:bg-slate-50/50">
              <td className="border border-slate-400 p-2 text-center">{i + 1}</td>
              <td className="border border-slate-400 p-2 font-semibold">{seg.name}</td>
              <td className="border border-slate-400 p-2 text-center">{seg.length_m} m</td>
              <td className="border border-slate-400 p-2 text-center">{seg.width_cm} &times; {seg.depth_cm}</td>
              <td className="border border-slate-400 p-2 capitalize">{seg.material.replace('_', ' ')}</td>
              <td className="border border-slate-400 p-2 capitalize text-center font-bold">{seg.condition.replace('_', ' ')}</td>
              <td className="border border-slate-400 p-2 text-right font-mono">
                {calculateRAB(seg) > 0 ? calculateRAB(seg).toLocaleString('id-ID') : '-'}
              </td>
            </tr>
          ))}
          {/* Summary Row */}
          <tr className="bg-slate-100 font-bold">
            <td colSpan={2} className="border border-slate-400 p-2 text-right">CUMULATIVE TOTAL</td>
            <td className="border border-slate-400 p-2 text-center">{totalLength} m</td>
            <td colSpan={3} className="border border-slate-400 p-2"></td>
            <td className="border border-slate-400 p-2 text-right font-mono text-emerald-800">
              Rp {totalRAB.toLocaleString('id-ID')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tanda Tangan Pengesahan Laporan */}
      <div className="mt-12 flex justify-end">
        <div className="text-center w-64 text-sm">
          <p>Bobong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-semibold mt-1">Kepala Bidang Sumber Daya Air</p>
          <div className="h-20" /> {/* Space for signature */}
          <p className="font-bold underline">___________________________</p>
          <p className="text-xs text-slate-500">NIP. 19820311 201012 1 002</p>
        </div>
      </div>
    </div>
  );
}
export { PrintReportPage };
