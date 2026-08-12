'use client';
import { useState, useEffect } from 'react';
import { DrainageSegment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { HydrologySketch } from './hydrology-sketch';

interface HydrologyAnalysisProps { segment: DrainageSegment; }

export function HydrologyAnalysis({ segment }: HydrologyAnalysisProps) {
  const [rainIntensity, setRainIntensity] = useState(110);
  const [catchmentWidth, setCatchmentWidth] = useState(15);
  const [viewTab, setViewTab] = useState<'aktual' | 'rencana'>('aktual');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRainIntensity(Number(localStorage.getItem('pupr_rain_intensity')) || 110);
      setCatchmentWidth(Number(localStorage.getItem('pupr_catchment_width')) || 15);
    }
  }, []);

  const elevStart = segment.start_elevation_m ?? 0, elevEnd = segment.end_elevation_m ?? 0, deltaElev = elevStart - elevEnd;
  const slopePercent = segment.length_m > 0 ? (Math.abs(deltaElev) / segment.length_m) * 100 : 0;
  const S_val = Math.max(slopePercent / 100, 0.001);
  const runOffCoeff: Record<string, number> = { beton_precast: 0.85, pasangan_batu: 0.75, tanah: 0.50, belum_ada: 0.90, lainnya: 0.70 };
  const C = runOffCoeff[segment.material] || 0.7;
  const Q_rencana = 0.278 * C * rainIntensity * ((segment.length_m * catchmentWidth) / 1000000);
  const B = segment.width_cm / 100, H = segment.depth_cm / 100, V = 0.85;
  const Q_aktual = V * (B * H);
  const isSafe = Q_aktual >= Q_rencana;
  const h = Math.min(Q_rencana / (V * B), H);
  const freeboard = Math.max(H - h, 0);

  // Kalkulasi Ilmiah Dimensi Rekomendasi (Manning Best Hydraulic Section)
  const manning_n: Record<string, number> = { beton_precast: 0.013, pasangan_batu: 0.017, tanah: 0.025, belum_ada: 0.015, lainnya: 0.020 };
  const n_val = manning_n[segment.material] || 0.017;
  const h_rec = Math.pow((Q_rencana * n_val * Math.pow(2, 2/3)) / (2 * Math.sqrt(S_val)), 3/8);
  const B_rec_cm = Math.ceil(h_rec * 2 * 100);
  const f_rec = Math.min(Math.max(Math.sqrt(0.5 * h_rec), 0.15), 0.30);
  const H_rec_cm = Math.ceil((h_rec + f_rec) * 100);

  return (
    <Card className="border border-slate-100 shadow-sm bg-slate-50/30 overflow-hidden text-slate-800">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-1.5">
            <Waves className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
            <h4 className="font-bold text-xs text-slate-800 tracking-tight">ANALISIS HIDROLOGI & HIDROLIKA (SDA)</h4>
          </div>
          <Badge className={isSafe ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}>
            {isSafe ? 'Kapasitas Aman' : 'Rawan Meluap'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-650">
          <div>
            <p className="text-slate-400 font-medium">Beda Elevasi (Slope)</p>
            <p className="font-bold text-slate-850">{elevStart}m &rarr; {elevEnd}m ({slopePercent.toFixed(2)}%)</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Arah Aliran</p>
            <p className="font-bold text-slate-850 flex items-center gap-1"><ArrowDownRight className="h-3.5 w-3.5 text-blue-600" />{deltaElev >= 0 ? 'Awal ke Akhir' : 'Akhir ke Awal'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-[10px] text-slate-650 bg-white p-2.5 rounded-lg border border-slate-100">
          <div><p className="text-slate-400 font-semibold">Lebar parit (B)</p><p className="font-mono font-bold text-slate-800">{B.toFixed(2)} m</p></div>
          <div><p className="text-slate-400 font-semibold">Dalam parit (H)</p><p className="font-mono font-bold text-slate-800">{H.toFixed(2)} m</p></div>
          <div><p className="text-slate-400 font-semibold">Kemiringan (S)</p><p className="font-mono font-bold text-slate-800">{(S_val).toFixed(4)}</p></div>
          <div className="pt-1.5 border-t border-slate-50"><p className="text-slate-400 font-semibold">Tinggi air (h)</p><p className="font-mono font-bold text-blue-600">{h.toFixed(2)} m</p></div>
          <div className="pt-1.5 border-t border-slate-50"><p className="text-slate-400 font-semibold">Tinggi Jagaan</p><p className={`font-mono font-bold ${freeboard <= 0.1 ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}`}>{freeboard.toFixed(2)} m</p></div>
          <div className="pt-1.5 border-t border-slate-50"><p className="text-slate-400 font-semibold">Daya Tampung</p><p className={`font-bold ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`}>{isSafe ? 'Mencukupi' : 'Kelebihan'}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] border-t pt-2.5">
          <div className="bg-white p-2 rounded border"><p className="text-slate-400 font-medium">Debit Limpasan (Qr)</p><p className="font-mono text-xs font-bold text-slate-850">{Q_rencana.toFixed(4)} m³/s</p></div>
          <div className="bg-white p-2 rounded border"><p className="text-slate-400 font-medium">Kapasitas Maks (Qmax)</p><p className="font-mono text-xs font-bold text-slate-850">{Q_aktual.toFixed(4)} m³/s</p></div>
        </div>

        <div className="text-[11px] pt-1">
          {isSafe ? (
            <div className="flex items-start gap-1.5 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /><p>Aman. Tinggi jagaan <strong>({freeboard.toFixed(2)}m)</strong> mencukupi.</p>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 p-2 bg-rose-50 text-rose-800 rounded border border-rose-100">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" /><p>Rawan. Luapan setinggi <strong>{Math.abs(H-h).toFixed(2)}m</strong> di atas bibir parit!</p>
            </div>
          )}
        </div>

        {/* Tab untuk Saluran yang Meluap */}
        {!isSafe && (
          <div className="flex rounded-md bg-slate-200/50 p-1 text-[11px] text-slate-800 gap-1 mt-2">
            <button onClick={() => setViewTab('aktual')} className={`flex-1 py-1 rounded text-center font-bold transition-all ${viewTab === 'aktual' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Kondisi Saat Ini</button>
            <button onClick={() => setViewTab('rencana')} className={`flex-1 py-1 rounded text-center font-bold transition-all ${viewTab === 'rencana' ? 'bg-white shadow-sm text-emerald-800' : 'text-slate-500'}`}>Rekomendasi Rencana</button>
          </div>
        )}

        {/* Render Sketch secara Dinamis */}
        {viewTab === 'rencana' && !isSafe ? (
          <>
            <HydrologySketch width_cm={B_rec_cm} depth_cm={H_rec_cm} water_height_m={h_rec} freeboard_m={f_rec} label="Rencana Penampang Aman (Best Hydraulic Section)" />
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-[10.5px] text-emerald-800 leading-relaxed space-y-1">
              <p className="font-bold border-b border-emerald-250 pb-1">💡 ANALISIS DESAIN PERBAIKAN:</p>
              <p>1. Dimensi parit diperlebar menjadi <strong>{B_rec_cm} cm</strong> dan diperdalam menjadi <strong>{H_rec_cm} cm</strong>.</p>
              <p>2. Rasio desain optimal menggunakan rumus hidrolis terbaik parit persegi ($B = 2h$).</p>
              <p>3. Kapasitas baru mampu mengalirkan debit air hujan rencana dengan tinggi jagaan aman <strong>{f_rec.toFixed(2)} m</strong>.</p>
            </div>
          </>
        ) : (
          <HydrologySketch width_cm={segment.width_cm} depth_cm={segment.depth_cm} water_height_m={h} freeboard_m={freeboard} label="Dimensi Penampang Parit Aktual" />
        )}
      </CardContent>
    </Card>
  );
}
export default HydrologyAnalysis;
