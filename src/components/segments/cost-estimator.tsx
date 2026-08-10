'use client';

import { useState, useEffect } from 'react';
import { DrainageSegment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';

interface CostEstimatorProps {
  segment: DrainageSegment;
}

export function CostEstimator({ segment }: CostEstimatorProps) {
  const length = Number(segment.length_m);
  const width = Number(segment.width_cm) / 100;
  const depth = Number(segment.depth_cm) / 100;
  const volume = length * width * depth;

  const [rates, setRates] = useState({
    cleaning: 120000,
    majorRepair: 2200000,
    minorRepair: 850000,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_shs');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRates({
            cleaning: Number(parsed.cleaning) || 120000,
            majorRepair: Number(parsed.majorRepair) || 2200000,
            minorRepair: Number(parsed.minorRepair) || 850000,
          });
        } catch (e) { console.error(e); }
      }
    }
  }, []);

  let estimatedCost = 0;
  let workType = 'Tidak ada rekomendasi pekerjaan fisik';

  if (segment.condition === 'tersumbat') {
    estimatedCost = volume * rates.cleaning;
    workType = 'Normalisasi & Pengerukan Sedimen';
  } else if (segment.condition === 'rusak_berat') {
    estimatedCost = length * rates.majorRepair;
    workType = 'Rehabilitasi Total Dinding Saluran';
  } else if (segment.condition === 'rusak_ringan') {
    estimatedCost = length * rates.minorRepair;
    workType = 'Pemeliharaan Rutin / Tambal Sulam';
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="border border-emerald-100 bg-emerald-50/20 shadow-sm rounded-xl overflow-hidden mt-3">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg shrink-0">
          <Calculator className="h-5 w-5" />
        </div>
        <div className="space-y-1 flex-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Estimasi RAB Perbaikan</p>
          <p className="text-sm font-semibold text-slate-800">{workType}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-emerald-700">
              {estimatedCost > 0 ? formatRupiah(estimatedCost) : 'Rp 0'}
            </span>
            {estimatedCost > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                (Standar SHS Kab. Pulau Taliabu)
              </span>
            )}
          </div>
          {estimatedCost > 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              * Perhitungan: {segment.condition === 'tersumbat' 
                ? `Volume ${volume.toFixed(2)} m³ x ${formatRupiah(rates.cleaning)}/m³` 
                : `Panjang ${length} m x ${formatRupiah(segment.condition === 'rusak_berat' ? rates.majorRepair : rates.minorRepair)}/m`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default CostEstimator;
