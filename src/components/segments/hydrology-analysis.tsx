'use client';

import { useState, useEffect } from 'react';
import { DrainageSegment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HydrologyAnalysisProps {
  segment: DrainageSegment;
}

export function HydrologyAnalysis({ segment }: HydrologyAnalysisProps) {
  const [rainIntensity, setRainIntensity] = useState(110);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_rain_intensity');
      if (stored) setRainIntensity(Number(stored) || 110);
    }
  }, []);

  const elevStart = segment.start_elevation_m ?? 0, elevEnd = segment.end_elevation_m ?? 0;
  const deltaElev = elevStart - elevEnd;
  const slopePercent = segment.length_m > 0 ? (Math.abs(deltaElev) / segment.length_m) * 100 : 0;
  const flowDir = deltaElev >= 0 ? 'Awal ke Akhir' : 'Akhir ke Awal';
  const runOffCoeff: Record<string, number> = { beton_precast: 0.85, pasangan_batu: 0.75, tanah: 0.50, belum_ada: 0.90, lainnya: 0.70 };
  const C = runOffCoeff[segment.material] || 0.7;
  const I = rainIntensity;
  const catchmentArea = (segment.length_m * 15) / 1000000;
  const Q_rencana = 0.278 * C * I * catchmentArea;
  const B = segment.width_cm / 100, H = segment.depth_cm / 100, V = 0.85;
  
  // Kapasitas Hidrolik Maksimum Qmax
  const Q_aktual = V * (B * H);
  const isSafe = Q_aktual >= Q_rencana;
  const overflowRisk = ((Q_rencana - Q_aktual) / Q_rencana) * 100;

  // Tinggi Muka Air Rencana (h) & Tinggi Jagaan (Freeboard)
  const h = Math.min(Q_rencana / (V * B), H);
  const freeboard = Math.max(H - h, 0);

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

        {/* Topography Info */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-650">
          <div>
            <p className="text-slate-400 font-medium">Beda Elevasi (Topografi)</p>
            <p className="font-bold text-slate-850">{elevStart}m &rarr; {elevEnd}m (Slope: {slopePercent.toFixed(2)}%)</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Arah Aliran Alami</p>
            <p className="font-bold text-slate-850 flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-blue-600" />
              {flowDir}
            </p>
          </div>
        </div>

        {/* Parameter Hidrolika */}
        <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-[10px] text-slate-650 bg-white p-2.5 rounded-lg border border-slate-100">
          <div>
            <p className="text-slate-400 font-semibold">Lebar Saluran (B)</p>
            <p className="font-mono font-bold text-slate-800">{B.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold">Tinggi Saluran (H)</p>
            <p className="font-mono font-bold text-slate-800">{H.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold">Kemiringan (S)</p>
            <p className="font-mono font-bold text-slate-800">{(slopePercent/100).toFixed(4)}</p>
          </div>
          <div className="pt-1.5 border-t border-slate-50">
            <p className="text-slate-400 font-semibold">Tinggi Air Rencana (h)</p>
            <p className="font-mono font-bold text-blue-600">{h.toFixed(2)} m</p>
          </div>
          <div className="pt-1.5 border-t border-slate-50">
            <p className="text-slate-400 font-semibold">Tinggi Jagaan</p>
            <p className={`font-mono font-bold ${freeboard <= 0.1 ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}`}>
              {freeboard.toFixed(2)} m
            </p>
          </div>
          <div className="pt-1.5 border-t border-slate-50">
            <p className="text-slate-400 font-semibold">Daya Tampung</p>
            <p className={`font-bold ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isSafe ? 'Mencukupi' : 'Kelebihan'}
            </p>
          </div>
        </div>

        {/* Flow comparison stats */}
        <div className="grid grid-cols-2 gap-2 text-[11px] border-t pt-2.5">
          <div className="bg-white p-2 rounded border">
            <p className="text-slate-400 font-medium">Debit Limpasan (Qr)</p>
            <p className="font-mono text-xs font-bold text-slate-850">{Q_rencana.toFixed(4)} m³/s</p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="text-slate-400 font-medium">Kapasitas Maks (Qmax)</p>
            <p className="font-mono text-xs font-bold text-slate-850">{Q_aktual.toFixed(4)} m³/s</p>
          </div>
        </div>

        {/* Capacity Verdict */}
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

        {/* Visual Sketsa Penampang Basah */}
        <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-lg border border-slate-100 mt-2 text-slate-800">
          <p className="text-[8px] uppercase font-bold text-slate-400 mb-1.5">Sketsa Dimensi Penampang Parit</p>
          <div className="relative w-36 h-20 border-b-4 border-x-4 border-slate-600 bg-slate-100/50 flex items-end overflow-hidden rounded-b-md">
            <div className="w-full bg-blue-500/35 border-t-2 border-blue-500 transition-all duration-300 flex items-center justify-center text-[8px] text-blue-900 font-extrabold" style={{ height: `${Math.min((h / H) * 100, 100)}%` }}>
              {h > 0 && `h: ${h.toFixed(2)}m`}
            </div>
            <div className="absolute left-1.5 top-1 text-[8px] text-slate-400 font-bold">H: {H.toFixed(2)}m</div>
            <div className="absolute right-1.5 top-1 text-[8px] text-slate-500 font-bold bg-amber-50 px-1 rounded border border-amber-200">Jagaan: {freeboard.toFixed(2)}m</div>
          </div>
          <div className="w-36 text-center text-[8px] text-slate-400 font-bold mt-1">Lebar (B): {B.toFixed(2)}m</div>
        </div>
      </CardContent>
    </Card>
  );
}
export default HydrologyAnalysis;
