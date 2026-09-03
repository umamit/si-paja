'use client';

import { DrainageSegment } from '@/types';

interface PrintTableProps {
  segments: DrainageSegment[];
  rates: { cleaning: number; majorRepair: number; minorRepair: number };
}

export function PrintTable({ segments, rates }: PrintTableProps) {
  const calculateRAB = (seg: DrainageSegment) => {
    const vol = Number(seg.length_m) * (Number(seg.width_cm) / 100) * (Number(seg.depth_cm) / 100);
    if (seg.condition === 'tersumbat') return vol * rates.cleaning;
    if (seg.condition === 'rusak_berat') return Number(seg.length_m) * rates.majorRepair;
    if (seg.condition === 'rusak_ringan') return Number(seg.length_m) * rates.minorRepair;
    return 0;
  };

  const totalLength = segments.reduce((sum, seg) => sum + Number(seg.length_m), 0);
  const totalRAB = segments.reduce((sum, seg) => sum + calculateRAB(seg), 0);

  return (
    <div>
      <table className="w-full border-collapse border border-slate-400 text-xs">
        <thead>
          <tr className="bg-slate-100 font-bold text-slate-900">
            <th className="border border-slate-400 p-2 w-10 text-center">No</th>
            <th className="border border-slate-400 p-2 text-left">Nama Segmen Drainase</th>
            <th className="border border-slate-400 p-2 text-center">Panjang</th>
            <th className="border border-slate-400 p-2 text-center">Dimensi (L x D)</th>
            <th className="border border-slate-400 p-2 text-center">Material</th>
            <th className="border border-slate-400 p-2 text-center">Kondisi Fisik</th>
            <th className="border border-slate-400 p-2 text-right">Estimasi RAB (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {segments.length === 0 ? (
            <tr>
              <td colSpan={7} className="border border-slate-400 p-4 text-center text-slate-500 italic">
                Tidak ada data segmen drainase untuk ruang jalan yang dipilih.
              </td>
            </tr>
          ) : (
            segments.map((seg, i) => (
              <tr key={seg.id} className="hover:bg-slate-50">
                <td className="border border-slate-400 p-2 text-center font-mono">{i + 1}</td>
                <td className="border border-slate-400 p-2 font-semibold text-slate-900">{seg.name}</td>
                <td className="border border-slate-400 p-2 text-center font-mono">{seg.length_m} m</td>
                <td className="border border-slate-400 p-2 text-center font-mono">{seg.width_cm} x {seg.depth_cm} cm</td>
                <td className="border border-slate-400 p-2 capitalize text-center">{seg.material.replace('_', ' ')}</td>
                <td className="border border-slate-400 p-2 capitalize text-center font-semibold">{seg.condition.replace('_', ' ')}</td>
                <td className="border border-slate-400 p-2 text-right font-mono font-medium">
                  {calculateRAB(seg) > 0 ? `Rp ${calculateRAB(seg).toLocaleString('id-ID')}` : '-'}
                </td>
              </tr>
            ))
          )}
          {/* Total Row */}
          <tr className="bg-slate-100 font-bold text-slate-900">
            <td colSpan={2} className="border border-slate-400 p-2 text-right uppercase tracking-wider">TOTAL AKUMULASI</td>
            <td className="border border-slate-400 p-2 text-center font-mono">{totalLength} m</td>
            <td colSpan={3} className="border border-slate-400 p-2"></td>
            <td className="border border-slate-400 p-2 text-right font-mono text-emerald-900 font-extrabold text-sm">
              Rp {totalRAB.toLocaleString('id-ID')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Lembar Tanda Tangan Pengesahan */}
      <div className="mt-10 flex justify-end">
        <div className="text-center w-64 text-sm">
          <p>Bobong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-semibold mt-1">Kepala Bidang Sumber Daya Air</p>
          <div className="h-20" />
          <p className="font-bold underline">___________________________</p>
          <p className="text-xs text-slate-500">NIP. 19820311 201012 1 002</p>
        </div>
      </div>
    </div>
  );
}
