'use client';

import { DrainageSegment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HydrologyAnalysisProps {
  segment: DrainageSegment;
}

export function HydrologyAnalysis({ segment }: HydrologyAnalysisProps) {
  const elevStart = segment.start_elevation_m ?? 0;
  const elevEnd = segment.end_elevation_m ?? 0;
  const deltaElev = elevStart - elevEnd;
  const slopePercent = segment.length_m > 0 ? (Math.abs(deltaElev) / segment.length_m) * 100 : 0;
  
  const flowDir = deltaElev >= 0 
    ? 'Mengalir dari Awal ke Akhir' 
    : 'Mengalir dari Akhir ke Awal';

  // Koefisien Limpasan (C) berdasarkan material
  const runOffCoeff: Record<string, number> = {
    beton_precast: 0.85,
    pasangan_batu: 0.75,
    tanah: 0.50,
    belum_ada: 0.90,
    lainnya: 0.70,
  };

  const C = runOffCoeff[segment.material] || 0.7;
  const I = 110; // Intensitas Curah Hujan Rencana Bobong (mm/jam) - Hujan Ekstrim
  const catchmentArea = (segment.length_m * 15) / 1000000; // Lebar koridor tangkapan air jalan = 15m (dalam km2)
  
  // Debit Limpasan Rencana Q = 0.278 * C * I * A (m3/s)
  const Q_rencana = 0.278 * C * I * catchmentArea;

  // Kapasitas Hidrolik Aktual Saluran Q_aktual = V * (L * D)
  const widthM = segment.width_cm / 100;
  const depthM = segment.depth_cm / 100;
  const V = 0.85; // Asumsi kecepatan aliran rata-rata (m/s)
  const Q_aktual = V * (widthM * depthM);

  const isSafe = Q_aktual >= Q_rencana;
  const overflowRisk = ((Q_rencana - Q_aktual) / Q_rencana) * 100;

  return (
    <Card className="border border-slate-100 shadow-sm bg-slate-50/30 overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-1.5">
            <Waves className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
            <h4 className="font-bold text-xs text-slate-800 tracking-tight">ANALISIS HIDROLOGI & ELEVASI</h4>
          </div>
          <Badge className={isSafe ? 'bg-emerald-100 text-emerald-800 border-emerald-250' : 'bg-rose-100 text-rose-800 border-rose-250'}>
            {isSafe ? 'Kapasitas Aman' : 'Rawan Meluap'}
          </Badge>
        </div>

        {/* Topography Info */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-650">
          <div>
            <p className="text-slate-400 font-medium">Beda Elevasi (Topografi)</p>
            <p className="font-bold text-slate-800">{elevStart}m &rarr; {elevEnd}m (Slope: {slopePercent.toFixed(2)}%)</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Arah Aliran Alami</p>
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-blue-600" />
              {flowDir}
            </p>
          </div>
        </div>

        {/* Flow comparison stats */}
        <div className="grid grid-cols-2 gap-2 text-[11px] border-t pt-2.5">
          <div className="bg-white p-2 rounded border">
            <p className="text-slate-400 font-medium">{"Debit Limpasan Rencana (Qr)"}</p>
            <p className="font-mono text-xs font-bold text-slate-800">{Q_rencana.toFixed(4)} m³/dtk</p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="text-slate-400 font-medium">{"Kapasitas Maksimal (Qmax)"}</p>
            <p className="font-mono text-xs font-bold text-slate-800">{Q_aktual.toFixed(4)} m³/dtk</p>
          </div>
        </div>

        {/* Capacity Verdict */}
        <div className="text-[11px] pt-1.5">
          {isSafe ? (
            <div className="flex items-start gap-1.5 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>Dimensi penampang mencukupi untuk menampung curah hujan rencana di area koridor Bobong ini.</p>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 p-2 bg-rose-50 text-rose-800 rounded border border-rose-100">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p>Debit air melampaui daya tampung sebesar <strong>{overflowRisk.toFixed(1)}%</strong>. Perlu pelebaran penampang atau pengerukan sedimen.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default HydrologyAnalysis;
